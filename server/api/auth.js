// ===================================================================
// LUỒNG ĐĂNG NHẬP
//   1. Web gửi tên + mật khẩu → so với .env → tạo token gửi về
//   2. Web gửi kèm token ở mọi request → requireLogin kiểm tra
//   3. Đăng xuất → xóa token
// Token lưu trong bộ nhớ nên tắt backend là phải đăng nhập lại.
// ===================================================================
import crypto from "node:crypto";
import { Router } from "express";
import { config } from "../config.js";

export const authRoutes = Router();

const tokens = new Map(); // token -> thời điểm hết hạn (mili giây)

// Lấy token từ header "Authorization: Bearer <token>"
function readToken(request) {
  const header = request.headers.authorization || "";
  return header.slice(7); // bỏ 7 ký tự "Bearer "
}

// 1. Đăng nhập
authRoutes.post("/auth/login", (request, response) => {
  const { username, password } = request.body;

  if (username !== config.loginUser || password !== config.loginPassword) {
    response.status(401).json({
      success: false,
      error: { message: "Sai tên đăng nhập hoặc mật khẩu." },
    });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, Date.now() + config.tokenHours * 60 * 60 * 1000);
  response.json({ success: true, data: { token } });
});

// 2. Gác cổng: server.js đặt hàm này trước các API cần đăng nhập
export function requireLogin(request, response, next) {
  const token = readToken(request);
  const expiresAt = tokens.get(token);

  if (!expiresAt || expiresAt < Date.now()) {
    response.status(401).json({
      success: false,
      error: { message: "Chưa đăng nhập hoặc token đã hết hạn." },
    });
    return;
  }
  next();
}

// 3. Đăng xuất
authRoutes.post("/auth/logout", (request, response) => {
  tokens.delete(readToken(request));
  response.json({ success: true });
});
