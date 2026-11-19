import "dotenv/config";
import mysql from "mysql2/promise";

export const database = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "Z",
});

export const config = {
  port: Number(process.env.PORT || 3000),
  mqttUrl: process.env.MQTT_URL,
  mqttUser: process.env.MQTT_USER,
  mqttPassword: process.env.MQTT_PASSWORD,
  sensorTopic: process.env.MQTT_SENSOR_TOPIC,
  statusTopic: process.env.MQTT_STATUS_TOPIC,
  controlTopic: process.env.MQTT_CONTROL_TOPIC,
  actionTimeoutMs: Number(process.env.ACTION_TIMEOUT_MS || 5000),
  loginUser: process.env.LOGIN_USER || "admin",
  loginPassword: process.env.LOGIN_PASSWORD,
  tokenHours: Number(process.env.TOKEN_HOURS || 8),
};