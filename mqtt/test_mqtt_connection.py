import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883
TOPIC = "demo/topic"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker!")
        client.subscribe(TOPIC)
    else:
        print("❌ Connection failed")

def on_message(client, userdata, msg):
    print(f"📩 Message received on {msg.topic}: {msg.payload.decode()}")

# Create client and attach callbacks
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to local broker
client.connect(BROKER, PORT, 60)

# Start listening loop
client.loop_start()

# Publish a test message
client.publish(TOPIC, "Hello from Python!")

# Keep running for a few seconds
import time
time.sleep(3)
client.loop_stop()
client.disconnect()

