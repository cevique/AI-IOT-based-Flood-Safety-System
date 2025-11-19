import joblib
import numpy as np
import paho.mqtt.client as mqtt
import json
import time

BROKER = "192.168.1.28"
PORT = 1883
DEVICE_ID = "esp32-01"

mqtt_client = mqtt.Client()
mqtt_client.connect(BROKER, PORT, 60)
mqtt_client.loop_start()

model = joblib.load("logreg_v1.joblib")

def features_from_readings(readings):
    arr = np.array(readings)
    return np.array([arr.mean(), np.polyfit(range(len(arr)), arr, 1)[0], arr.std()])

def publish_ai_result(device_id, prob):
    topic = f"laptop/ai/{device_id}/result"
    payload = {"device_id": device_id, "timestamp": int(time.time()), "flood_probability": float(prob)}
    mqtt_client.publish(topic, json.dumps(payload))
    print("AI result published:", payload)
