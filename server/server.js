import express from "express";
import { config, database } from "./config.js";
import { startMqtt } from "./mqtt/index.js";
import { authRoutes, requireLogin } from "./api/auth.js";
import { dashboardRoutes } from "./api/dashboard.js";
import { alertRoutes } from "./api/alerts.js";
import { deviceRoutes } from "./api/devices.js";
import { historyRoutes } from "./api/historyTable.js";
import { sensorTableRoutes } from "./api/sensorTable.js";

await database.query("SELECT 1");
console.log("Đã nối MySQL");

const app = express();
app.use(express.json());                       // để đọc request.body, đặt trước các route
app.use("/api/v1", authRoutes);                // đăng nhập: không cần token
app.use("/api/v1", requireLogin);              // gác cổng: từ dòng này trở xuống phải có token
app.use("/api/v1", dashboardRoutes);
app.use("/api/v1", alertRoutes);
app.use("/api/v1", deviceRoutes);
app.use("/api/v1", historyRoutes);
app.use("/api/v1", sensorTableRoutes);
app.use(express.static("dist"));

startMqtt();
app.listen(config.port, () => {
  console.log(`Server đã chạy ở http://localhost:${config.port}`);
});

