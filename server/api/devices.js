import { Router } from "express";
import { config, database } from "../config.js";
import { sendCommandToEsp } from "../mqtt/device.js";

export const deviceRoutes = Router();

deviceRoutes.post("/devices/:id/actions", async (request, response) => {
  const deviceId = Number(request.params.id);
  const action = request.body.action;                      // "TURN_ON" hoặc "TURN_OFF"

  await database.execute(
    `INSERT INTO action_history (device_id, action, status, sent_at)
     VALUES (?, ?, 'PENDING', ?)`,
    [deviceId, action, new Date()],
  );

  sendCommandToEsp(deviceId, action);                      // gửi "1_ON" cho ESP

  response.json({ success: true });
});

deviceRoutes.get("/devices", async (request, response) => {
  const [rows] = await database.query(
    "SELECT id, name, type, status FROM device ORDER BY id",
  );
  response.json({ success: true, data: rows });
});

// Lệnh PENDING quá thời gian chờ thì đổi thành FAILED.
// Không có bộ đếm riêng: historyTable.js gọi hàm này mỗi khi web hỏi lịch sử.
export async function failTimedOutActions() {
  const deadline = new Date(Date.now() - config.actionTimeoutMs);   // 5 giây trước
  await database.execute(
    `UPDATE action_history
     SET status = 'FAILED', failure_reason = 'TIMEOUT'
     WHERE status = 'PENDING' AND sent_at <= ?`,
    [deadline],
  );
}