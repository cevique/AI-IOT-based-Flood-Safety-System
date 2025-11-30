import joblib
import numpy as np
import paho.mqtt.client as mqtt
import json
import time

BROKER = "192.168.10.8"
PORT = 1883
DEVICE_ID = "esp32-01"

mqtt_client = mqtt.Client()
mqtt_client.connect(BROKER, PORT, 60)

# Buffer to store last N readings
readings_buffer = []
BUFFER_SIZE = 10  # Need enough points for polyfit

model = joblib.load("logreg_v1.joblib")

def features_from_readings(readings):
    arr = np.array(readings)
    # Features: [mean, slope, std]
    # slope is from polyfit(x, y, 1)[0]
    slope = np.polyfit(range(len(arr)), arr, 1)[0]
    return np.array([arr.mean(), slope, arr.std()])

def publish_ai_result(device_id, prob):
    topic = f"laptop/ai/{device_id}/result"
    payload = {"device_id": device_id, "timestamp": int(time.time()), "flood_probability": float(prob)}
    mqtt_client.publish(topic, json.dumps(payload))
    print(f"AI result published: {prob:.2f}")

def on_message(client, userdata, message):
    try:
        payload = json.loads(message.payload.decode())
        if "distance" in payload:
            dist = float(payload["distance"])
            readings_buffer.append(dist)
            
            # Keep buffer size fixed
            if len(readings_buffer) > BUFFER_SIZE:
                readings_buffer.pop(0)
            
            # Run inference if we have enough data
            if len(readings_buffer) == BUFFER_SIZE:
                feats = features_from_readings(readings_buffer)
                # Model expects 2D array: [[mean, slope, std]]
                prob = model.predict_proba([feats])[0][1] # Probability of class 1 (Flood)
                publish_ai_result(DEVICE_ID, prob)
                
    except Exception as e:
        print(f"Error processing message: {e}")

mqtt_client.on_message = on_message
mqtt_client.subscribe(f"esp32/{DEVICE_ID}/telemetry")
mqtt_client.loop_forever()
