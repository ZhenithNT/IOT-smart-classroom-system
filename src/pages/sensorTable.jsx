// ===================================================================
// LUỒNG BẢNG DATA SENSOR (giao diện). Backend: server/api/sensorTable.js
//   1. Người dùng chọn bộ lọc: tìm theo, ô tìm kiếm, sắp xếp, trang, số hàng
//   2. Cứ 3 giây (hoặc ngay khi đổi bộ lọc) tải GET /sensor-data?...
//   3. Vẽ bảng + thanh phân trang
// ===================================================================
import { useState } from "react";
import { toQuery, useApi } from "../api";
import { IconSearch, Pagination, formatTime, sensorLabels } from "../common";

// Tên trong ô "Tìm theo" → mã loại cảm biến gửi lên API
const SENSOR_TYPES = {
  "Ánh sáng": "LIGHT",
  "Nhiệt độ": "TEMPERATURE",
  "Độ ẩm": "HUMIDITY",
  "Cảm biến 1": "ALERT1",
  "Cảm biến 2": "ALERT2",
  "Cảm biến 3": "ALERT3",
};

export default function SensorTable() {
  // ----- 1. BỘ LỌC -----
  const [criterion, setCriterion] = useState("Ánh sáng");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("measuredAt:DESC");   // dạng "cột:chiều"
  const [sortBy, sortOrder] = sort.split(":");

  // ----- 2. TẢI DỮ LIỆU THEO BỘ LỌC -----
  const query = toQuery({
    page,
    limit: pageSize,
    search,
    sortBy,
    sortOrder,
    type: search ? SENSOR_TYPES[criterion] || "" : "",
    criterion: criterion === "Thời gian" ? "time" : "value",
  });
  const table = useApi("/sensor-data?" + query);
  const rows = table?.data || [];
  const total = table?.meta?.totalItems || 0;

  // Đổi bộ lọc thì quay về trang 1
  function changeFilter(setValue) {
    return (event) => {
      setValue(event.target.value);
      setPage(1);
    };
  }

  // ----- 3. VẼ TRANG -----
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Dữ liệu cảm biến</h1>
      </div>

      {/* Thanh bộ lọc */}
      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">Tìm theo</span>
          <select
            className="filter-select"
            value={criterion}
            onChange={changeFilter(setCriterion)}
          >
            <option>Ánh sáng</option>
            <option>Nhiệt độ</option>
            <option>Độ ẩm</option>
            <option>Cảm biến 1</option>
            <option>Cảm biến 2</option>
            <option>Cảm biến 3</option>
            <option>Thời gian</option>
          </select>
        </div>

        <div className="search-input-wrapper">
          <IconSearch />
          <input
            className="filter-input"
            value={search}
            onChange={changeFilter(setSearch)}
            aria-label="Tìm dữ liệu cảm biến"
            placeholder={
              criterion === "Thời gian"
                ? "Nhập thời gian (vd: 08:30, 27/10/2026)..."
                : `Nhập giá trị ${criterion.toLowerCase()} cần tìm...`
            }
          />
        </div>

        <select
          className="filter-select sort-select"
          aria-label="Sắp xếp cảm biến"
          value={sort}
          onChange={changeFilter(setSort)}
        >
          <option value="measuredAt:DESC">Thời gian mới nhất</option>
          <option value="measuredAt:ASC">Thời gian cũ nhất</option>
          <option value="value:ASC">Giá trị tăng dần</option>
          <option value="value:DESC">Giá trị giảm dần</option>
          <option value="type:ASC">Loại cảm biến</option>
        </select>
      </div>

      {/* Bảng dữ liệu */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Loại cảm biến</th>
              <th>Giá trị</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="cell-id">{item.id}</td>
                <td>{sensorLabels[item.sensorType] || item.sensorType}</td>
                <td className="cell-value">
                  {item.value} {item.unit}
                </td>
                <td className="cell-time">{formatTime(item.measuredAt)}</td>
              </tr>
            ))}
            {!rows.length && table && (
              <tr>
                <td colSpan="4" className="empty-cell">
                  Chưa có dữ liệu phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          total={total}
          shown={rows.length}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
}