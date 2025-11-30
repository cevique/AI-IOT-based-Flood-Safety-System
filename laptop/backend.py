import json
import time
import sqlite3
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
import paho.mqtt.client as mqtt

import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = 1883
DEVICE_ID = "esp32-01"
DB_FILE = "flood_data.db"

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
            "floodIncomingCount": flood_incoming
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
