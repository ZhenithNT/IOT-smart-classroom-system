import { Line } from "react-chartjs-2";
import { useApi } from "../api";
import { IconAlertLed, formatClock } from "../common";

const COLORS = ["#F59E0B", "#3B82F6", "#EF4444"];
const CHART_KEYS = ["s1", "s2", "s3"];
const tick = { color: "#6B7280", font: { size: 12 } };
const grid = { color: "#F3F4F6" };

// LED nháy khi giá trị vượt 50% thang đo (cùng quy tắc với code Arduino)
function isAlert(sensor) {
  return sensor.value * 2 > sensor.max;
}

// Cấu hình biểu đồ: trục dọc chạy từ 0 đến thang đo lớn nhất của cảm biến
function makeOptions(max) {
  return {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid, ticks: { ...tick, maxTicksLimit: 5 } },
      y: { min: 0, max, grid, ticks: tick },
    },
  };
}

// Dữ liệu biểu đồ: 1 đường giá trị + 1 đường ngưỡng nét đứt
function makeChartData(points, sensor, index) {
  return {
    labels: points.map((point) => point.time),
    datasets: [
      {
        label: sensor.name,
        data: points.map((point) => point[CHART_KEYS[index]]),
        borderColor: COLORS[index],
        backgroundColor: COLORS[index],
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Ngưỡng 50%",
        data: points.map(() => sensor.threshold),
        borderColor: "#9CA3AF",
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
      },
    ],
  };
}

export default function Alert() {
  // 1. Tải giá trị mới nhất + 20 điểm biểu đồ của 3 cảm biến
  const alerts = useApi("/alerts");
  const sensors = alerts?.data?.sensors || [];
  const chart = [];
  for (const point of alerts?.data?.chart || []) {
    chart.push({ time: formatClock(point.time), s1: point.s1, s2: point.s2, s3: point.s3 });
  }

  // 2. Vẽ 3 hàng: giá trị, biểu đồ, LED
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Cảnh báo</h1>
        <p className="page-subtitle">
          3 cảm biến ngẫu nhiên, LED nháy khi giá trị lớn hơn 50% thang đo
        </p>
      </div>

      {/* Hàng 1: giá trị hiện tại */}
      <div className="alert-row">
        {sensors.map((sensor, index) => (
          <div className="metric-card" key={sensor.id}>
            <div className="metric-header">
              <span className="metric-label">{sensor.name}</span>
            </div>
            <div className="metric-body">
              <span className="metric-value" style={{ color: COLORS[index] }}>
                {sensor.value ?? "—"}
              </span>
              <span className="metric-unit">/ {sensor.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hàng 2: biểu đồ */}
      <div className="alert-row">
        {sensors.map((sensor, index) => (
          <div className="chart-card" key={sensor.id}>
            <div className="chart-header">
              <h2 className="chart-title">Biểu đồ {sensor.name.toLowerCase()}</h2>
            </div>
            <div className="chart-container alert-chart">
              {chart.length ? (
                <Line
                  data={makeChartData(chart, sensor, index)}
                  options={makeOptions(sensor.max)}
                />
              ) : (
                <p className="empty-cell">Chưa có dữ liệu để hiển thị</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hàng 3: LED cảnh báo (nháy khi vượt 50%) */}
      <div className="alert-row">
        {sensors.map((sensor, index) => {
          const blinking = isAlert(sensor);
          return (
            <div className="device-control-card" key={sensor.id}>
              <div className="device-item">
                <div className="device-left">
                  <div
                    className={
                      "device-icon-box alert-led " +
                      (blinking ? "alert-led-on" : "alert-led-off")
                    }
                  >
                    <IconAlertLed on={blinking} color={COLORS[index]} />
                  </div>
                  <div className="device-meta">
                    <span className="device-name">
                      LED {index + 1} · {sensor.pin}
                    </span>
                    <span
                      className={
                        "device-status " + (blinking ? "status-processing" : "")
                      }
                    >
                      {blinking
                        ? `Đang nhấp nháy · ${sensor.value} > ${sensor.threshold}`
                        : "Tắt · bình thường"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}