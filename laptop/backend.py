import os
import json
import time
import sqlite3
import threading
import paho.mqtt.client as mqtt
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from notification_service import NotificationService

load_dotenv()

# Configuration
BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = 1883
DEVICE_ID = "esp32-01"
DB_FILE = "flood_data.db"

# Alert Configuration
ALERT_THRESHOLD = 30  # seconds to wait before sending alert
ALERT_COOLDOWN = 300  # seconds between alerts
alert_start_time = None
last_alert_sent_time = 0
alert_active = False  # For frontend popup

notification_service = NotificationService()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database Setup
def init_db():
    conn = sqlite3.connect(DB_FILE, timeout=10)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS readings
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  timestamp INTEGER,
                  distance REAL,
                  status TEXT,
                  normal_count INTEGER,
                  flood_possible_count INTEGER,
                  flood_incoming_count INTEGER)''')
    # Use WAL to reduce read/write lock contention
    c.execute("PRAGMA journal_mode=WAL;")
    conn.commit()
    conn.close()


init_db()

# MQTT Setup
mqtt_client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    client.subscribe(f"esp32/{DEVICE_ID}/telemetry")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        print(f"Received: {payload}")
        
        # Save to DB
        conn = sqlite3.connect(DB_FILE, timeout=10)
        c = conn.cursor()
        c.execute("INSERT INTO readings (timestamp, distance, status, normal_count, flood_possible_count, flood_incoming_count) VALUES (?, ?, ?, ?, ?, ?)",
                  (int(time.time()), 
                   payload.get("distance", 0), 
                   payload.get("status", "Unknown"),
                   payload.get("normalCount", 0),
                   payload.get("floodPossibleCount", 0),
                   payload.get("floodIncomingCount", 0)))
        conn.commit()
        conn.close()

        # Alert Logic
        global alert_start_time, last_alert_sent_time, alert_active
        status = payload.get("status", "Safe")
        
        if status in ["Warning", "Severe"]:
            if alert_start_time is None:
                alert_start_time = time.time()
            
            duration = time.time() - alert_start_time
            if duration > ALERT_THRESHOLD:
                alert_active = True
                if time.time() - last_alert_sent_time > ALERT_COOLDOWN:
                    message = f"URGENT: Flood Status is {status}! Duration: {int(duration)}s. Immediate action required."
                    threading.Thread(target=notification_service.send_all, args=("FLOOD ALERT", message)).start()
                    last_alert_sent_time = time.time()
        else:
            alert_start_time = None
            alert_active = False
        
    except Exception as e:
        print(f"Error processing message: {e}")

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

def start_mqtt():
    try:
        mqtt_client.connect(BROKER, PORT, 60)
        mqtt_client.loop_forever()
    except Exception as e:
        print(f"MQTT Connection Error: {e}")

# Start MQTT in background thread
mqtt_thread = threading.Thread(target=start_mqtt)
mqtt_thread.daemon = True
mqtt_thread.start()

# API Routes
@app.route('/api/status', methods=['GET'])
def get_status():
    conn = sqlite3.connect(DB_FILE, timeout=10)
    c = conn.cursor()
    c.execute("SELECT * FROM readings ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    conn.close()

    if row:
        # row indices: id(0), timestamp(1), distance(2), status(3),
        # normal_count(4), flood_possible_count(5), flood_incoming_count(6)
        normal = row[4] or 0
        flood_possible = row[5] or 0
        flood_incoming = row[6] or 0

        return jsonify({
            "timestamp": row[1],
            "distance": row[2],
            "status": row[3],
            # keep existing counts object for your UI
            "counts": {
                "normal": normal,
                "warning": flood_possible,
                "severe": flood_incoming
            },
            # also include the original ESP32-style keys for compatibility
            "normalCount": normal,
            "floodPossibleCount": flood_possible,
            "floodIncomingCount": flood_incoming,
            "alert_active": alert_active
        })
    else:
        return jsonify({"status": "No Data", "distance": 0})


@app.route('/api/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect(DB_FILE, timeout=10)
    c = conn.cursor()
    c.execute("SELECT distance FROM readings ORDER BY id DESC LIMIT 20")
    rows = c.fetchall()
    conn.close()

    # Put oldest first
    history = [r[0] for r in rows][::-1]

    # Ensure exactly 20 numbers (use float cast)
    while len(history) < 20:
        history.insert(0, 50.0)

    history = [float(x) for x in history]
    return jsonify(history)


@app.route('/api/override', methods=['POST'])
def toggle_override():
    # Publish override command to ESP32
    # The ESP32 logic toggles on any "manual_override" command, so we just send one.
    payload = {"cmd": "manual_override", "value": True, "timestamp": int(time.time())}
    topic = f"laptop/commands/{DEVICE_ID}"
    mqtt_client.publish(topic, json.dumps(payload))
    return jsonify({"success": True, "message": "Override command sent"})

@app.route('/api/logs', methods=['GET'])
def get_logs():
    filter_date = request.args.get('filter', 'all')
    filter_status = request.args.get('status', 'all')

    # Use UTC+5 (or any fixed timezone) for consistent date filtering
    tz_offset = timedelta(hours=5)
    now_utc5 = datetime.now(timezone.utc) + tz_offset
    today_start = datetime(now_utc5.year, now_utc5.month, now_utc5.day, tzinfo=timezone.utc).timestamp()

    conn = sqlite3.connect(DB_FILE, timeout=10)
    c = conn.cursor()

    query = "SELECT timestamp, distance, status FROM readings WHERE 1=1"
    params = []

    # -----------------------------
    # Date Filter
    # -----------------------------
    if filter_date != "all":
        if filter_date == "today":
            start = int(today_start)
            query += " AND timestamp >= ?"
            params.append(start)
        elif filter_date == "yesterday":
            start = int(today_start - 86400)
            end = int(today_start)
            query += " AND timestamp >= ? AND timestamp < ?"
            params.extend([start, end])
        elif filter_date == "week":
            start = int(today_start - 7 * 86400)
            query += " AND timestamp >= ?"
            params.append(start)
        elif filter_date == "month":
            start = int(today_start - 30 * 86400)
            query += " AND timestamp >= ?"
            params.append(start)

    # -----------------------------
    # Status Filter
    # -----------------------------
    if filter_status != "all":
        query += " AND status = ?"
        params.append(filter_status)

    # -----------------------------
    # Ordering and limit
    # -----------------------------
    query += " ORDER BY timestamp DESC LIMIT 100"

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()

    logs = [{"timestamp": r[0], "distance": r[1], "status": r[2]} for r in rows]
    return jsonify(logs)

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    conn = sqlite3.connect(DB_FILE, timeout=10)
    c = conn.cursor()
    # Get last 100 readings for median
    c.execute("SELECT distance FROM readings ORDER BY id DESC LIMIT 100")
    rows = c.fetchall()
    conn.close()
    
    if not rows:
        return jsonify({"median": 0, "trend": "Insufficient Data", "slope": 0})
        
    distances = [r[0] for r in rows][::-1] # Oldest to newest
    
    # 1. Median
    median_dist = float(np.median(distances))
    
    # 2. Trend (Linear Regression on last 20 points)
    recent_data = distances[-20:]
    if len(recent_data) > 1:
        X = np.array(range(len(recent_data))).reshape(-1, 1)
        y = np.array(recent_data)
        model = LinearRegression()
        model.fit(X, y)
        slope = float(model.coef_[0])
        
        if slope < -0.1:
            trend = "Water Rising (Distance Decreasing)"
        elif slope > 0.1:
            trend = "Water Receding (Distance Increasing)"
        else:
            trend = "Stable"
    else:
        slope = 0
        trend = "Stable"
        
    return jsonify({
        "median": median_dist,
        "trend": trend,
        "slope": slope
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
