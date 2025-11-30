import mqtt from "mqtt";

export const client = mqtt.connect("ws://192.168.10.8:9001");

client.on("connect", () => {
  console.log("Dashboard connected to MQTT WebSocket 🎉");
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});
