// ESP giả: dùng khi chưa cắm mạch. Làm giống mạch thật:
//   1. Cứ 3 giây gửi số đo vào topic sensor_data
//   2. Nhận lệnh bật/tắt ở topic device_control, trả "ACK ..." vào topic device_status
//
// Chạy (ở thư mục code, cần file .env): npm run simulate
// ESP im lặng (để thử lệnh thất bại):   npm run simulate -- --silent
// Không chạy cùng lúc với mạch ESP thật vì dùng chung topic.
import "dotenv/config";
import mqtt from "mqtt";

if (!process.env.MQTT_URL) {
  console.log("Chưa có file .env. Chạy: copy ..\\code-2\\.env .env");
  process.exit(1);
}

const silent = process.argv.includes("--silent");
const sensorTopic = process.env.MQTT_SENSOR_TOPIC;
const controlTopic = process.env.MQTT_CONTROL_TOPIC;
const statusTopic = process.env.MQTT_STATUS_TOPIC;

const client = mqtt.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASSWORD,
});

// ----- 1. SỐ ĐO GIẢ: mỗi lần nhích nhẹ quanh giá trị trước đó -----
let temp = 30;
let humid = 70;
let light = 600;

function drift(value, step, min, max) {
  const next = value + (Math.random() * 2 - 1) * step;
  return Math.min(max, Math.max(min, next));
}

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function sendReading() {
  if (!client.connected) return;
  temp = drift(temp, 0.5, 25, 35);
  humid = drift(humid, 1, 50, 90);
  light = drift(light, 40, 0, 1023);

  const data = {
    temp: Number(temp.toFixed(1)),
    humid: Number(humid.toFixed(1)),
    light: Math.round(light),
    s1: randomInt(11),       // 3 cảm biến cảnh báo: thang 0-11, 0-101, 0-1001
    s2: randomInt(101),
    s3: randomInt(1001),
  };
  client.publish(sensorTopic, JSON.stringify(data));
  console.log("Gửi số đo:", JSON.stringify(data));
}

// ----- 2. NHẬN LỆNH, TRẢ ACK -----
client.on("connect", () => {
  console.log("ESP giả đã nối Mosquitto" + (silent ? " (chế độ im lặng: không trả ACK)" : ""));
  client.subscribe(controlTopic);
});

client.on("error", (error) => console.log("[MQTT lỗi]", error.message));

client.on("message", (topic, payload) => {
  const command = payload.toString();           // ví dụ "1_ON"
  console.log("Nhận lệnh:", command);
  if (silent) return;

  setTimeout(() => {
    client.publish(statusTopic, "ACK " + command);   // ví dụ "ACK 1_ON"
    console.log("  → trả lời: ACK " + command);
  }, 300);
});

setInterval(sendReading, 3000);
