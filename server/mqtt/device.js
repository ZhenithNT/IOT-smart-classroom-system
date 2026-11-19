import { config, database } from "../config.js";
import { publish } from "./index.js";

export function sendCommandToEsp(deviceId, action) {
  const command = deviceId + "_" + (action === "TURN_ON" ? "ON" : "OFF");   // ví dụ "1_ON"
  publish(config.controlTopic, command);
}

export async function handleAck(message) {
  const command = message.replace("ACK ", "");       // "ACK 1_ON" → "1_ON"
  const [id, state] = command.split("_");            // "1_ON" → id = "1", state = "ON"
  if (state !== "ON" && state !== "OFF") return;     // không phải tin ACK thì bỏ qua
  const deviceId = Number(id);                       // 1
  const action = state === "ON" ? "TURN_ON" : "TURN_OFF";

  // Lệnh PENDING (còn trong thời gian chờ) → SUCCESS
  const deadline = new Date(Date.now() - config.actionTimeoutMs);
  const [result] = await database.execute(
    `UPDATE action_history
     SET status = 'SUCCESS', response_at = ?
     WHERE device_id = ? AND action = ? AND status = 'PENDING' AND sent_at > ?`,
    [new Date(), deviceId, action, deadline],
  );
  if (result.affectedRows === 0) return;             // không có lệnh nào đang chờ thì dừng

  // Đèn/Quạt đổi trạng thái thật
  await database.execute("UPDATE device SET status = ? WHERE id = ?", [state, deviceId]);
}