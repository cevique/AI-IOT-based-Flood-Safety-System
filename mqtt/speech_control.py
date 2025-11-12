import speech_recognition as sr
import paho.mqtt.client as mqtt
import pyttsx3
import time

# === MQTT CONFIGURATION ===
BROKER = "localhost"
PORT = 1883
TOPIC = "flood/control"

# === SPEECH FEEDBACK ===
engine = pyttsx3.init()
engine.setProperty('rate', 160)  # speaking speed

def speak(text):
    """Let the computer speak feedback."""
    print(f"💬 {text}")
    engine.say(text)
    engine.runAndWait()

# === MQTT SETUP ===
client = mqtt.Client()

def connect_mqtt():
    try:
        client.connect(BROKER, PORT, 60)
        speak("Connected to MQTT broker successfully.")
    except Exception as e:
        speak(f"Failed to connect to broker: {e}")

# === COMMAND MAP ===
commands = {
    "turn on pump": "PUMP_ON",
    "turn off pump": "PUMP_OFF",
    "start alarm": "ALARM_ON",
    "stop alarm": "ALARM_OFF",
    "check status": "STATUS_CHECK"
}

# === SPEECH RECOGNIZER ===
recognizer = sr.Recognizer()
microphone = sr.Microphone()

def listen_for_command():
    """Capture speech and convert to text."""
    with microphone as source:
        print("\n🎙️ Listening... Speak now.")
        recognizer.adjust_for_ambient_noise(source, duration=0.8)
        audio = recognizer.listen(source)
    try:
        command_text = recognizer.recognize_google(audio).lower()
        print(f"✅ Recognized: {command_text}")
        return command_text
    except sr.UnknownValueError:
        speak("Sorry, I did not catch that.")
        return None
    except sr.RequestError:
        speak("Speech recognition service unavailable.")
        return None

# === MAIN LOOP ===
def main():
    connect_mqtt()
    speak("Voice control is ready. Say a command.")
    time.sleep(1)

    while True:
        command_text = listen_for_command()
        if not command_text:
            continue

        matched = False
        for phrase, msg in commands.items():
            if phrase in command_text:
                client.publish(TOPIC, msg)
                speak(f"Command '{phrase}' sent as '{msg}'")
                matched = True
                break

        if not matched:
            speak("Command not recognized. Please try again.")

        # Optional exit command
        if "exit" in command_text or "stop listening" in command_text:
            speak("Exiting voice control.")
            break

if __name__ == "__main__":
    main()
