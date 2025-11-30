import json
import time
import paho.mqtt.client as mqtt

BROKER = "192.168.10.8"   # your Mosquitto broker IP
PORT = 1883
DEVICE_ID = "esp32-01"

client = mqtt.Client()
client.connect(BROKER, PORT, 60)
client.loop_start()

def publish_override(cmd, value):
    """Send override or reride command to ESP32"""
    payload = {"cmd": cmd, "value": value, "timestamp": int(time.time())}
    topic = f"laptop/commands/{DEVICE_ID}"
    client.publish(topic, json.dumps(payload))
    print(f"Published {cmd}={value}")

def on_message(client, userdata, message):
    """Receive telemetry from ESP32"""
    payload = json.loads(message.payload.decode())
    print(f"Telemetry received: {payload}")
    # Optional: call AI inference here

# Subscribe to telemetry from ESP32
client.subscribe(f"esp32/{DEVICE_ID}/telemetry")
client.on_message = on_message

# Example: send manual override ON
publish_override("manual_override", True)

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Exiting...")
    client.loop_stop()
