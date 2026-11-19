// ===================================================================
// ĐỒ DÙNG CHUNG cho các trang. File này không chứa luồng xử lý nào,
// chỉ là "hộp đồ nghề" để các trang lấy ra dùng:
//
//   1. Định dạng giờ + nhãn tiếng Việt
//   2. Bật thư viện biểu đồ Chart.js
//   3. Thanh phân trang (Data Sensor, History Action)
//   4. Các icon SVG
// ===================================================================
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

// ----- 1. ĐỊNH DẠNG GIỜ + NHÃN -----

// Đổi giờ sang giờ Việt Nam, ví dụ "27/10/2026 14:05:09"
export function formatTime(value) {
  if (!value) return "—";
  return new Date(value)
    .toLocaleString("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour12: false })
    .replace(",", "");
}

// Chỉ lấy phần giờ, ví dụ "14:05:09" (dùng cho trục ngang biểu đồ)
export function formatClock(value) {
  return new Date(value).toLocaleTimeString("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

// Mã loại cảm biến → tên tiếng Việt
export const sensorLabels = {
  LIGHT: "Ánh sáng",
  TEMPERATURE: "Nhiệt độ",
  HUMIDITY: "Độ ẩm",
  ALERT1: "Cảm biến 1",
  ALERT2: "Cảm biến 2",
  ALERT3: "Cảm biến 3",
};

// Hành động và trạng thái của lệnh điều khiển
export const actionLabels = { TURN_ON: "Bật", TURN_OFF: "Tắt" };
export const statusLabels = {
  PENDING: "Đang xử lý",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
};

// Lý do lệnh thất bại
export const failureLabels = {
  TIMEOUT: "ESP không phản hồi đúng thời hạn",
};

// ----- 2. BIỂU ĐỒ: bật các "bộ phận" của Chart.js mà web dùng -----
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

// ----- 3. THANH PHÂN TRANG -----
export function Pagination({ total, shown, page, setPage, pageSize, setPageSize }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => Math.max(1, Math.min(page - 2, totalPages - 4)) + index,
  ); // [1, 2, 3, ...]

  return (
    <div className="pagination-footer">
      <div className="pagination-info">
        Hiển thị {shown} / {total} kết quả
      </div>

      <div className="pagination-controls">
        <button
          className="page-btn page-arrow"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ← Trước
        </button>

        {pageNumbers.map((n) => (
          <button
            key={n}
            className={"page-btn " + (page === n ? "active" : "")}
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        ))}

        <button
          className="page-btn page-arrow"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Tiếp →
        </button>
      </div>

      <div className="page-size-selector">
        <select
          className="page-size-select"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={5}>5 hàng / trang</option>
          <option value={10}>10 hàng / trang</option>
          <option value={20}>20 hàng / trang</option>
        </select>
      </div>
    </div>
  );
}

// ----- 4. ICON (hình vẽ SVG) -----
export function IconLogo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00A86B"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07" />
    </svg>
  );
}

export function IconDashboard() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconSensor() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20M17 5v14M7 9v10M22 12H2" />
    </svg>
  );
}

export function IconHistory() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function IconProfile() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconSun() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F59E0B"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" fill="#FEF3C7" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function IconTemp() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#EF4444"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

export function IconHumid() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3B82F6"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="#DBEAFE" />
    </svg>
  );
}

export function IconBulb({ on = false }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={on ? "#FEF3C7" : "none"}
      stroke={on ? "#F59E0B" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: "all 0.3s ease" }}
    >
      <path d="M9 18h6M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
    </svg>
  );
}

export function IconFan({ on = false }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={on ? "#00A86B" : "#9CA3AF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={on ? "fan-spinning" : ""}
      style={{ transition: "stroke 0.3s ease" }}
    >
      <circle cx="12" cy="12" r="3" fill={on ? "#A7F3D0" : "none"} />
      <path d="M12 9C10.5 5 13 2 15 3s1.5 4 0 6M15 12c4 1.5 7-1 6-3s-4-1.5-6 0M12 15c1.5 4-1 7-3 6s-1.5-4 0-6M9 12c-4-1.5-7 1-6 3s4 1.5 6 0" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconUserAvatar() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" fill="#F3F4F6" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

export function IconAlert() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function IconAlertLed({ on = false, color = "#EF4444" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2">
      <circle
        cx="12"
        cy="12"
        r="6"
        fill={on ? color : "#9CA3AF"}
        stroke={on ? color : "#9CA3AF"}
      />
      <path
        d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke={on ? color : "#D1D5DB"}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLogout() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
