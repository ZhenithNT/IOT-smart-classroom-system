import { Line } from "react-chartjs-2";
import { useApi } from "../api";
import { IconSun, IconTemp, IconHumid, formatClock } from "../common";
import DeviceControl from "./devices";

// Màu của 3 cảm biến (dùng cho biểu đồ và chú thích)
const COLORS = { light: "#F59E0B", temp: "#EF4444", humid: "#3B82F6" };

export default function Dashboard() {
  // 1. Lấy số đo mới nhất từ backend, tách ra 3 biến
  const latest = useApi("/sensor-data/latest");
  const sensor = { light: null, temp: null, humid: null };
  for (const reading of latest?.data || []) {
    if (reading.type === "LIGHT") sensor.light = reading.value;
    if (reading.type === "TEMPERATURE") sensor.temp = reading.value;
    if (reading.type === "HUMIDITY") sensor.humid = reading.value;
  }

  // 2. Lấy 20 điểm gần nhất để vẽ biểu đồ
  const chartApi = useApi("/sensor-data/chart");
  const points = [];
  for (const point of chartApi?.data || []) {
    points.push({
      time: formatClock(point.time),     // "14:05:09"
      light: point.light,
      temp: point.temperature,
      humid: point.humidity,
    });
  }
  const chartData = {
    labels: points.map((point) => point.time),
    datasets: [
      makeLine(points, "Ánh sáng", "light", "yLight"),
      makeLine(points, "Nhiệt độ", "temp", "yTempHumid"),
      makeLine(points, "Độ ẩm", "humid", "yTempHumid"),
    ],
  };

  // 3. Hiện 3 thẻ số đo + ô điều khiển Đèn/Quạt + biểu đồ
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Gửi dữ liệu mỗi 3 giây</p>
      </div>

      <div className="dashboard-grid">
        <SensorCard label="Ánh sáng" value={sensor.light} unit="ADC" icon={<IconSun />} />
        <SensorCard label="Nhiệt độ" value={sensor.temp} unit="°C" icon={<IconTemp />} />
        <SensorCard label="Độ ẩm" value={sensor.humid} unit="%" icon={<IconHumid />} />
        <DeviceControl />
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h2 className="chart-title">Biểu đồ dữ liệu cảm biến</h2>
          <div className="chart-legend">
            <LegendItem color={COLORS.light} text="Ánh sáng" />
            <LegendItem color={COLORS.temp} text="Nhiệt độ" />
            <LegendItem color={COLORS.humid} text="Độ ẩm" />
          </div>
        </div>
        <div className="chart-container">
          {points.length ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="empty-cell">Chưa có dữ liệu để hiển thị</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Một thẻ số đo
function SensorCard({ label, value, unit, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-title-group">
          {icon}
          <span className="metric-label">{label}</span>
        </div>
      </div>
      <div className="metric-body">
        <span className="metric-value">{value ?? "—"}</span>
        <span className="metric-unit">{unit}</span>
      </div>
    </div>
  );
}

// Một mục chú thích: chấm màu + tên
function LegendItem({ color, text }) {
  return (
    <span className="legend-item">
      <span className="legend-dot" style={{ backgroundColor: color }} />
      {text}
    </span>
  );
}

// Một đường trên biểu đồ. key: cột dữ liệu cần vẽ, axis: dùng trục dọc nào
function makeLine(points, label, key, axis) {
  return {
    label,
    data: points.map((point) => point[key]),
    borderColor: COLORS[key],
    backgroundColor: COLORS[key],
    yAxisID: axis,
    tension: 0.35,
    borderWidth: 2,
    pointRadius: 3,
  };
}

// Cấu hình biểu đồ: trục ngang là giờ, trục trái là °C và %, trục phải là ánh sáng
const tick = { color: "#6B7280", font: { size: 12 } };
const grid = { color: "#F3F4F6" };

const chartOptions = {
  animation: false,                       // tắt hoạt ảnh để số đo mới hiện ngay
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },           // chú thích đã tự vẽ ở trên
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid, ticks: tick },
    yTempHumid: {
      type: "linear",
      position: "left",
      min: 0,
      max: 100,
      title: { display: true, text: "°C / %" },
      grid,
      ticks: { ...tick, stepSize: 50 },
    },
    yLight: {
      type: "linear",
      position: "right",
      min: 0,
      max: 1200,
      title: { display: true, text: "ADC" },
      grid: { drawOnChartArea: false },
      ticks: { ...tick, stepSize: 600 },
    },
  },
};