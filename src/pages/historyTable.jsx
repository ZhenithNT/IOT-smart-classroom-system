// ===================================================================
// LUỒNG BẢNG HISTORY ACTION (giao diện). Backend: server/api/historyTable.js
//   1. Người dùng chọn bộ lọc: thiết bị, hành động, trạng thái, tìm kiếm, trang
//   2. Cứ 3 giây (hoặc ngay khi đổi bộ lọc) tải GET /actions?...
//   3. Vẽ bảng lịch sử + thanh phân trang
// ===================================================================
import { useState } from "react";
import { toQuery, useApi } from "../api";
import {
  IconSearch,
  Pagination,
  actionLabels,
  failureLabels,
  formatTime,
  statusLabels,
} from "../common";

// Trạng thái lệnh → tên class CSS (màu của nhãn)
const STATUS_CLASSES = {
  SUCCESS: "status-success",
  PENDING: "status-pending",
  FAILED: "status-failed",
};

// Một ô chọn lọc có nhãn bên trái
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <select
        className="filter-select"
        aria-label={label}
        value={value}
        onChange={onChange}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function HistoryTable() {
  // ----- 1. BỘ LỌC ("" nghĩa là Tất cả) -----
  const [deviceId, setDeviceId] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ----- 2. TẢI DỮ LIỆU THEO BỘ LỌC -----
  const query = toQuery({ page, limit: pageSize, deviceId, action, status, search });
  const table = useApi("/actions?" + query);
  const rows = table?.data || [];
  const total = table?.meta?.totalItems || 0;

  // Tạo hàm xử lý: lưu giá trị mới rồi quay về trang 1
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
        <h1 className="page-title">Lịch sử điều khiển</h1>
      </div>

      {/* Thanh bộ lọc */}
      <div className="filter-bar">
        <FilterSelect
          label="Thiết bị"
          value={deviceId}
          onChange={changeFilter(setDeviceId)}
          options={[
            { value: "", label: "Tất cả" },
            { value: "1", label: "Đèn" },
            { value: "2", label: "Quạt" },
          ]}
        />
        <FilterSelect
          label="Hành động"
          value={action}
          onChange={changeFilter(setAction)}
          options={[
            { value: "", label: "Tất cả" },
            { value: "TURN_ON", label: "Bật" },
            { value: "TURN_OFF", label: "Tắt" },
          ]}
        />
        <FilterSelect
          label="Trạng thái"
          value={status}
          onChange={changeFilter(setStatus)}
          options={[
            { value: "", label: "Tất cả" },
            { value: "SUCCESS", label: "Thành công" },
            { value: "PENDING", label: "Đang xử lý" },
            { value: "FAILED", label: "Thất bại" },
          ]}
        />
        <div className="search-input-wrapper">
          <IconSearch />
          <input
            className="filter-input"
            value={search}
            onChange={changeFilter(setSearch)}
            aria-label="Tìm lịch sử điều khiển"
            placeholder="Tìm tên thiết bị..."
          />
        </div>
      </div>

      {/* Bảng lịch sử */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên thiết bị</th>
              <th>Hành động</th>
              <th>Trạng thái</th>
              <th>Thời gian gửi</th>
              <th>Thời gian phản hồi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="cell-id">#A{item.id}</td>
                <td>{item.deviceName}</td>
                <td>{actionLabels[item.action]}</td>
                <td>
                  <span className={"status-badge " + STATUS_CLASSES[item.status]}>
                    {statusLabels[item.status]}
                  </span>
                  {item.failureReason && (
                    <span className="failure-detail">
                      {failureLabels[item.failureReason] || item.failureReason}
                    </span>
                  )}
                </td>
                <td className="cell-time">{formatTime(item.sentAt)}</td>
                <td className="cell-time">{formatTime(item.responseAt)}</td>
              </tr>
            ))}
            {!rows.length && table && (
              <tr>
                <td colSpan="6" className="empty-cell">
                  Chưa có lịch sử phù hợp
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