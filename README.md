# Risin' Technologies - Water Intelligence System

**Risin' Technologies** presents the **Water Intelligence System**, a cutting-edge IoT solution designed for real-time flood monitoring and safety. This system integrates advanced sensors, AI analytics, and a modern dashboard to provide actionable insights and early warnings.

> **Note**: This system is a prototype for the upcoming **SineraOS** ecosystem.

## 🚀 Features

-   **Real-Time Monitoring**: Live water level tracking using ultrasonic sensors.
-   **AI Analytics**: Linear regression models to predict flood trends (Rising, Receding, Stable).
-   **Interactive Dashboard**: A beautiful React-based UI with Three.js visuals and real-time charts.
-   **Smart Alerts**: Automated notifications when flood risks are detected.
-   **Manual Override**: Remote control capabilities for system testing and emergency response.
-   **Historical Data**: Detailed logs and history of sensor readings.

## 🏗️ System Architecture

The system follows a robust IoT architecture:

1.  **Edge Device (ESP32)**:
    -   Reads distance data from ultrasonic sensors.
    -   Publishes telemetry to MQTT topics.
    -   Listens for remote commands.
2.  **Communication Layer (MQTT)**:
    -   Handles low-latency messaging between the device and the backend.
3.  **Backend (Python/Flask)**:
    -   Subscribes to MQTT topics.
    -   Stores data in a SQLite database (`flood_data.db`).
    -   Runs AI analysis (Linear Regression).
    -   Exposes a RESTful API for the frontend.
4.  **Frontend (React/Vite)**:
    -   Fetches data from the Flask API.
    -   Displays real-time status, charts, and alerts.
    -   Provides a stunning landing page with 3D visuals.

## 🛠️ Tech Stack

-   **Hardware**: ESP32, Ultrasonic Sensor (HC-SR04), LEDs/Buzzer.
-   **Firmware**: C++ (Arduino Framework).
-   **Backend**: Python, Flask, Paho-MQTT, SQLite, Scikit-Learn, NumPy.
-   **Frontend**: React, Vite, TailwindCSS, DaisyUI, Chart.js, Three.js (@react-three/fiber).

## 📦 Installation & Setup

### Prerequisites
-   Node.js & npm
-   Python 3.8+
-   MQTT Broker (e.g., Mosquitto) running locally or remotely.

### 1. Backend Setup
Navigate to the `laptop` directory:
```bash
cd laptop
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file (optional, defaults to localhost):
```env
MQTT_BROKER=localhost
```

Run the backend:
```bash
python backend.py
```
*The server will start on `http://localhost:5000`.*

### 2. Dashboard Setup
Navigate to the `dashboard/dashboard` directory:
```bash
cd dashboard/dashboard
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
*The dashboard will launch at `http://localhost:5173`.*

### 3. ESP32 Setup
-   Open `esp32/esp32.ino` in Arduino IDE or PlatformIO.
-   Update the WiFi credentials and MQTT broker IP in the code.
-   Flash the firmware to your ESP32.

## 📡 MQTT Topics

| Topic | Direction | Description |
| :--- | :--- | :--- |
| `esp32/sensor/distance` | ESP32 -> Broker | Raw distance readings |
| `esp32/status` | ESP32 -> Broker | Current safety status (Safe, Warning, Severe) |
| `esp32/cmd/override` | Broker -> ESP32 | Manual override command |
| `esp32/ack/override` | ESP32 -> Broker | Acknowledgment of override |
| `laptop/commands/esp32` | Backend -> ESP32 | Control commands from the dashboard |

## 🖥️ API Endpoints

-   `GET /api/status`: Current system status and latest reading.
-   `GET /api/history`: Last 20 distance readings.
-   `GET /api/logs`: Historical logs with filtering options.
-   `GET /api/analytics`: AI-driven trend analysis (Slope, Median).
-   `POST /api/override`: Trigger manual override.

## 🌟 Usage

1.  **Landing Page**: Open the web app to see the Risin' Technologies 3D intro.
2.  **Dashboard**: Click "Check Dashboard" to view live data.
3.  **Monitoring**: Watch the "Flood Case" status and the real-time chart.
4.  **Analytics**: Check the "Charts" tab for AI predictions on water trends.
5.  **Alerts**: View past alerts in the "Alerts" tab.

---

&copy; 2025 Risin' Technologies. All rights reserved.