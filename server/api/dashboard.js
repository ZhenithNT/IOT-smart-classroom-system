import { Router } from "express";
import { database } from "../config.js";
import { getChart } from "./helpers.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/sensor-data/latest", async (request, response) => {
  const data = [];
  for (const id of [1, 2, 3]) {
    const [rows] = await database.query(
      `SELECT s.id AS sensorId, s.name, s.type, s.unit, d.value, d.measured_at AS measuredAt
       FROM sensor s
       JOIN sensor_data d ON d.sensor_id = s.id
       WHERE s.id = ?
       ORDER BY d.id DESC
       LIMIT 1`,
      [id],
    );
    if (rows.length > 0) data.push(rows[0]);
  }
  response.json({ success: true, data });
});

// 20 điểm gần nhất để vẽ biểu đồ
dashboardRoutes.get("/sensor-data/chart", async (request, response) => {
  const data = await getChart([1, 2, 3], ["light", "temperature", "humidity"]);
  response.json({ success: true, data });
});