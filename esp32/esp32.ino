// #include <SoftwareSerial.h>
#include <WiFi.h>
#include <Wire.h>
#include <PubSubClient.h>
#include <LiquidCrystal_I2C.h>

// ===== WiFi + Mosquitto =====
const char* ssid = "PTCL-BB";       //  enter WIFI SSID
const char* password = "76BD68EE";  //  enter WIFI Password

const char* mqtt_server = "192.168.10.7";  // your Mosquitto server IP
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// counters for pie chart
int floodPossibleCount = 0;
int floodIncomingCount = 0;
int normalCount = 0;

// Flood monitor - debounce + hysteresis
const int ledPin = 19;     //  Control LED ON/OFF state
const int buzzerPin = 18;  //  Control Buzzer ON/OFF state
// const int RX = 10; //  Arduino receive signal transmitted by GSM
// const int TX = 11;  //  Arduino transmits signal received by GSM
const int buttonPin = 5;  // push button input
const int buttonPin2 = 4; // Unused in new logic but kept for pin def
long duration;                    // time (µs) between send and receive
float distanceCm;                 // measured distance from sensor to water
float prevdistanceCm = 31.0;      //  can be anything outside threshold to run code for 1st time

// Thresholds
const float safeThreshold = 24.0;   // > 24 is Safe
const float severeThreshold = 21.0; // <= 21 is Severe

// debounce / stability settings
const int alarmLimit = 3;  // number of consecutive readings required to enter alarm
int alarmCount = 0;
bool manualOverride = false;  // false = normal mode, true = override active

LiquidCrystal_I2C lcd(0x27, 16, 2);

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(message);

  if (String(topic) == "laptop/commands/esp32-01") {
    if (message.indexOf("manual_override") >= 0) {
      // Toggle override on command
      manualOverride = !manualOverride;
      if (manualOverride) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Remote Override");
        delay(800);
        lcd.clear();
      } else {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Remote Resume");
        delay(800);
        lcd.clear();
      }
    }
  }
}

void setup() {
  Serial.begin(115200);
  // --- WiFi Connect ---
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // --- MQTT setup ---
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  while (!client.connected()) {
    Serial.print("Connecting to Mosquitto...");
    if (client.connect("ESP32Client")) {
      Serial.println("connected!");
      client.subscribe("laptop/commands/esp32-01");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 3s");
      delay(3000);
    }
  }
  
  lcd.init();  // initialize LCD
  Wire.begin();
  Wire.setClock(400000);
  lcd.backlight();
  pinMode(ledPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);  // active LOW
  pinMode(buttonPin2, INPUT_PULLUP);
}

void checkOverrideButton() {
  // Simple toggle logic on button press
  if (digitalRead(buttonPin) == LOW) {
    delay(50); // debounce
    if (digitalRead(buttonPin) == LOW) {
      manualOverride = !manualOverride;
      
      lcd.clear();
      lcd.setCursor(0, 0);
      if (manualOverride) {
        lcd.print("Manual Override");
      } else {
        lcd.print("Auto Resumed");
      }
      delay(1000); // Prevent multiple toggles
      lcd.clear();
    }
  }
}

double readSensor() {
  // Generate a random number between 0 and 100 using ESP32's hardware random function
  int randVal = esp_random() % 100;  // esp_random() returns a 32-bit random number

  // If randVal is less than 70, generate a value between 25 and 50 (favoring higher values)
  // Otherwise, generate a value between 20 and 24
  if (randVal < 70) {
    distanceCm = random(25, 51);  // Random value between 25 and 50
  } else {
    distanceCm = random(20, 25);  // Random value between 20 and 24
  }

  return distanceCm;
}


void sendToThingsBoard(float distance, String status) {
  // Build JSON string manually
  String payload = "{\"distance\":";
  payload += String(distance, 2);
  payload += ",\"status\":\"" + status + "\"";

  // add counts for pie chart
  payload += ",\"normalCount\":" + String(normalCount);
  payload += ",\"floodPossibleCount\":" + String(floodPossibleCount);
  payload += ",\"floodIncomingCount\":" + String(floodIncomingCount);
  payload += "}";

  Serial.print("Sending payload: ");
  Serial.println(payload);

  // publish
  if (client.connected()) {
    client.publish("esp32/esp32-01/telemetry", payload.c_str());
  } else {
    Serial.println("MQTT disconnected, reconnecting...");
    if (client.connect("ESP32Client")) {
      client.subscribe("laptop/commands/esp32-01");
      client.publish("esp32/esp32-01/telemetry", payload.c_str());
    }
  }
}


void loop() {
  distanceCm = readSensor();
  checkOverrideButton();
  
  String status = "Safe";
  
  // Logic Flow
  // 1. Determine Status based on distance
  if (distanceCm > safeThreshold) {
    status = "Safe";
    normalCount++;
  } else if (distanceCm > severeThreshold) {
    status = "Warning";
    floodPossibleCount++;
  } else {
    status = "Severe";
    floodIncomingCount++;
  }

  // 2. Actuators (LED/Buzzer)
  if (status == "Severe") {
    if (manualOverride) {
      // Override active: Silence everything
      digitalWrite(ledPin, LOW);
      noTone(buzzerPin);
    } else {
      // Severe and no override: Alarm ON
      digitalWrite(ledPin, HIGH);
      tone(buzzerPin, 1000);
    }
  } else {
    // Safe or Warning: Everything OFF
    digitalWrite(ledPin, LOW);
    noTone(buzzerPin);
    
    // Auto-reset override if we return to safe/warning? 
    // User didn't explicitly ask for auto-reset, but it's good practice.
    // Keeping it manual toggle for now as per "When it's pressed again...".
  }

  // 3. LCD Display
  lcd.setCursor(0, 0);
  lcd.print("Dist: ");
  lcd.print(distanceCm);
  lcd.print("cm   ");
  
  lcd.setCursor(0, 1);
  if (manualOverride) {
    lcd.print("Override Active ");
  } else {
    lcd.print(status);
    lcd.print("          "); // clear rest of line
  }

  // 4. Telemetry
  sendToThingsBoard(distanceCm, status);
  client.loop();

  delay(500);
  prevdistanceCm = distanceCm;
}