import mqtt from "mqtt";
import { config } from "../config.js";
import { saveReading } from "./sensor.js";
import { handleAck } from "./device.js";

let client;

export function startMqtt() {
  client = mqtt.connect(config.mqttUrl, {
    username: config.mqttUser,
    password: config.mqttPassword,
  });

  client.on("connect", () => {
    client.subscribe([config.sensorTopic, config.statusTopic]);
  });

  client.on("error", (error) => console.error("[MQTT]", error.message));

  client.on("message", async (topic, payload) => {
    try {
      await handleMessage(topic, payload.toString());
    } catch (error) {
      console.error("[Tin MQTT lỗi]", error.message);
    }
  });
}

async function handleMessage(topic, message) {
  if (topic === config.sensorTopic) await saveReading(message);
  if (topic === config.statusTopic) await handleAck(message);
}

// Gửi tin xuống ESP (mqtt/device.js dùng để gửi lệnh).
// Chưa nối được Mosquitto thì báo lỗi, không để lệnh nằm chờ rồi gửi muộn.
export function publish(topic, message) {
  if (!client.connected) throw new Error("MQTT mất kết nối.");
  client.publish(topic, message, { retain: false });
}