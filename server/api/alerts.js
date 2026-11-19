import { Router } from "express";
import { database } from "../config.js";
import { getChart } from "./helpers.js";

export const alertRoutes = Router();

const ALERT_SENSORS = [
  { id: 4, name: "Cảm biến 1", max: 11, threshold: 5.5, pin: "D5" },
  { id: 5, name: "Cảm biến 2", max: 101, threshold: 50.5, pin: "D6" },
  { id: 6, name: "Cảm biến 3", max: 1001, threshold: 500.5, pin: "D7" },
];

alertRoutes.get("/alerts", async (request, response) => {
  const [latest] = await database.query(
    `SELECT sensor_id AS sensorId, value
     FROM sensor_data
     WHERE id IN (
       SELECT MAX(id) FROM sensor_data WHERE sensor_id IN (4, 5, 6) GROUP BY sensor_id
     )`,
  );

  const sensors = [];
  for (const sensor of ALERT_SENSORS) {
    let value = null;
    for (const row of latest) {
      if (row.sensorId === sensor.id) {
        value = row.value;
      }
    }
    sensors.push({ ...sensor, value });
  }

  const chart = await getChart([4, 5, 6], ["s1", "s2", "s3"]);
  response.json({ success: true, data: { sensors, chart } });
});