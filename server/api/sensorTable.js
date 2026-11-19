// ===================================================================
// LUỒNG BẢNG DATA SENSOR
//   GET /sensor-data?page=1&limit=10&search=...&type=...&sortBy=...&sortOrder=...
//   1. Đọc bộ lọc từ địa chỉ
//   2. Ghép điều kiện WHERE
//   3. Đếm tổng số dòng + lấy đúng 1 trang
// ===================================================================
import { Router } from "express";
import { database } from "../config.js";
import { createPage, readPagination } from "./helpers.js";

export const sensorTableRoutes = Router();

sensorTableRoutes.get("/sensor-data", async (request, response) => {
  // 1. Bộ lọc
  const query = request.query;
  const paging = readPagination(query);
  const search = (query.search || "").trim();
  const order = query.sortOrder === "ASC" ? "ASC" : "DESC";   // ghép thẳng vào SQL nên chỉ cho 2 giá trị

  // 2. Điều kiện WHERE: chỉ thêm điều kiện nào web có gửi lên
  const conditions = [];
  const values = [];
  if (query.type) {
    conditions.push("s.type = ?");
    values.push(query.type);
  }
  if (search && query.criterion === "time") {
    // +7 giờ để tìm theo giờ Việt Nam
    conditions.push(
      "DATE_FORMAT(DATE_ADD(d.measured_at, INTERVAL 7 HOUR), '%d/%m/%Y %H:%i:%s') LIKE ?",
    );
    values.push("%" + search + "%");
  } else if (search) {
    conditions.push("CAST(d.value AS CHAR) LIKE ?");
    values.push("%" + search + "%");
  }
  let where = "";
  if (conditions.length > 0) {
    where = "WHERE " + conditions.join(" AND ");
  }

  // Tên cột sắp xếp chỉ lấy từ danh sách này, không lấy trực tiếp từ người dùng
  const sortColumns = { type: "s.type", value: "d.value", measuredAt: "d.measured_at" };
  const sortColumn = sortColumns[query.sortBy] || "d.measured_at";
  const tables = "FROM sensor_data d JOIN sensor s ON s.id = d.sensor_id";

  // 3. Đếm + lấy 1 trang
  const [counted] = await database.execute(
    `SELECT COUNT(*) AS total ${tables} ${where}`,
    values,
  );
  const [rows] = await database.execute(
    `SELECT d.id, s.type AS sensorType, s.unit, d.value, d.measured_at AS measuredAt
     ${tables} ${where}
     ORDER BY ${sortColumn} ${order}, d.id ${order}
     LIMIT ${paging.limit} OFFSET ${paging.offset}`,
    values,
  );
  response.json(createPage(rows, counted[0].total, paging));
});