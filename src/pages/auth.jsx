// ===================================================================
// LUỒNG ĐĂNG NHẬP (giao diện). Backend: server/api/auth.js
//   1. Màn hình Login: gõ tên + mật khẩu → POST /auth/login
//   2. Đúng → lưu token (api.js) → App.jsx chuyển sang màn hình chính
//   3. logout: nút "Đăng xuất" ở menu → POST /auth/logout → xóa token → tải lại trang
// ===================================================================
import { useState } from "react";
import { callApi, clearToken, saveToken } from "../api";
import { IconLogo } from "../common";

// ----- 1 + 2. MÀN HÌNH ĐĂNG NHẬP -----
export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();   // không cho trình duyệt tải lại trang
    const result = await callApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (result.success) {
      saveToken(result.data.token);
      onLogin();              // báo cho App biết đã đăng nhập xong
    } else {
      setError(result.error.message);   // ví dụ "Sai tên đăng nhập hoặc mật khẩu."
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <IconLogo />
          <span className="logo-text">IOT System</span>
        </div>
        <h1 className="login-title">Đăng nhập</h1>

        <label className="login-label" htmlFor="username">
          Tên đăng nhập
        </label>
        <input
          id="username"
          className="filter-input login-input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <label className="login-label" htmlFor="password">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          className="filter-input login-input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <p className="login-error">{error}</p>}

        <button className="btn-apply login-button">Đăng nhập</button>
      </form>
    </div>
  );
}

// ----- 3. ĐĂNG XUẤT -----
export async function logout() {
  await callApi("/auth/logout", { method: "POST" });
  clearToken();
  window.location.reload();
}
