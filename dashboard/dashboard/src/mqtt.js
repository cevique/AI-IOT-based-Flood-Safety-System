import mqtt from "mqtt";

export const client = mqtt.connect("ws://localhost:9001");

client.on("connect", () => {
  console.log("Dashboard connected to MQTT WebSocket 🎉");
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});
