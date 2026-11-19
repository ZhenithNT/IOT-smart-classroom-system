// ===================================================================
// CÔNG CỤ NHỎ dùng chung cho các API (không chứa luồng nào)
//   readPagination  đọc ?page=&limit=
//   createPage      gói kết quả bảng kèm thông tin phân trang
//   getChart        lấy 20 điểm biểu đồ (Dashboard và Cảnh báo dùng)
// ===================================================================
import { database } from "../config.js";

// Ví dụ ?page=2&limit=10 → { page: 2, limit: 10, offset: 10 }
export function readPagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  return { page, limit, offset: (page - 1) * limit };
}

export function createPage(data, totalItems, paging) {
  return {
    success: true,
    data,
    meta: {
      page: paging.page,
      limit: paging.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / paging.limit),
    },
  };
}

// 20 lần đo gần nhất của các cảm biến trong ids (xếp từ cũ đến mới).
// Mỗi dòng trả về: { time, <tên 1>, <tên 2>, <tên 3> }.
export async function getChart(ids, names) {
  // 1. Lấy các dòng đo gần nhất: mỗi lần đo có 1 dòng cho mỗi cảm biến
  const [rows] = await database.query(
    `SELECT sensor_id, value, measured_at
     FROM sensor_data
     WHERE sensor_id IN (${ids.join(", ")})
     ORDER BY id DESC
     LIMIT ${ids.length * 20}`,
  );

  // 2. Gom các dòng cùng thời điểm thành một điểm: { time, s1, s2, s3 }
  const points = [];
  for (const row of rows) {
    let point = points.find((p) => p.time.getTime() === row.measured_at.getTime());
    if (!point) {
      point = { time: row.measured_at };
      for (const name of names) point[name] = null;
      points.push(point);
    }
    point[names[ids.indexOf(row.sensor_id)]] = row.value;
  }

  // 3. Đảo lại để lần đo cũ nhất nằm trước
  return points.reverse();
}