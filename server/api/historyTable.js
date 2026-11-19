import { Router } from "express";
import { database } from "../config.js";
import { failTimedOutActions } from "./devices.js";
import { createPage, readPagination } from "./helpers.js";

export const historyRoutes = Router();

historyRoutes.get("/actions", async (request, response) => {
  // 1. Lệnh chờ quá lâu → FAILED trước khi trả về
  await failTimedOutActions();

  // 2. Đọc trang nào, mỗi trang bao nhiêu dòng
  const query = request.query;
  const paging = readPagination(query);

  // 3. Ghép điều kiện lọc: chỉ thêm điều kiện nào web có gửi lên
  const conditions = [];
  const values = [];
  if (query.deviceId) {
    conditions.push("a.device_id = ?");
    values.push(query.deviceId);
  }
  if (query.action) {
    conditions.push("a.action = ?");
    values.push(query.action);
  }
  if (query.status) {
    conditions.push("a.status = ?");
    values.push(query.status);
  }
  if (query.search) {
    conditions.push("d.name LIKE ?");
    values.push("%" + query.search + "%");
  }

  let where = "";
  if (conditions.length > 0) {
    where = "WHERE " + conditions.join(" AND ");
  }

  // 4. Đếm tổng số dòng (để web biết có mấy trang)
  const tables = "FROM action_history a JOIN device d ON d.id = a.device_id";
  const [counted] = await database.execute(
    `SELECT COUNT(*) AS total ${tables} ${where}`,
    values,
  );

  // 5. Lấy đúng 1 trang, lệnh mới nhất lên đầu
  const [rows] = await database.execute(
    `SELECT a.id, a.device_id AS deviceId, d.name AS deviceName, a.action,
            a.status, a.failure_reason AS failureReason,
            a.sent_at AS sentAt, a.response_at AS responseAt
     ${tables} ${where}
     ORDER BY a.id DESC
     LIMIT ${paging.limit} OFFSET ${paging.offset}`,
    values,
  );

  response.json(createPage(rows, counted[0].total, paging));
});