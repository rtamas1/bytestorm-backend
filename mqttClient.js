import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

const mqttClient = mqtt.connect(process.env.MQTT_URL, {
  clientId: `backend_${Math.random().toString(16).slice(2, 8)}`,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");

  mqttClient.subscribe("smart/led", (err) => {
    if (err) {
      console.error("MQTT subscription error:", err);
    } else {
      console.log("Subscribed to smart/led");
    }
  });
});

export default mqttClient;



