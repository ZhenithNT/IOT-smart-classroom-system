import { database } from "../config.js";

const SENSOR_IDS = { light: 1, temp: 2, humid: 3, s1: 4, s2: 5, s3: 6 };

export async function saveReading(message) {
  const data = JSON.parse(message);
  const now = new Date(); // 6 dòng dùng chung một thời điểm

  const values = [];
  for (const key in SENSOR_IDS) {
    values.push(SENSOR_IDS[key], data[key], now);
  }
  
  await database.execute(
    `INSERT INTO sensor_data (sensor_id, value, measured_at)
     VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)`,
    values,
  );
}