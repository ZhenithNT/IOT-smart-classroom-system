import { useEffect, useState } from "react";

// 1. Token đăng nhập (lưu trong localStorage của trình duyệt)
const TOKEN_KEY = "iot_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// 2. Gọi một API, tự gắn token vào header
export async function callApi(path, options = {}) {
  const response = await fetch("/api/v1" + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (getToken() || ""),
    },
  });

  // 401 = token sai hoặc hết hạn: xóa token, tải lại trang để về màn hình đăng nhập
  // (trừ lúc đang đăng nhập, vì khi đó 401 nghĩa là sai mật khẩu)
  if (response.status === 401 && path !== "/auth/login") {
    clearToken();
    window.location.reload();
  }
  return await response.json();   // dạng { success, data, meta? }
}

// 3. Tải định kỳ: tải ngay khi mở trang, rồi lặp lại mỗi everyMs mili giây
export function useApi(path, everyMs = 3000) {
  const [result, setResult] = useState(null);

  async function loadData() {
    const response = await callApi(path);
    setResult(response);
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, everyMs);
    return () => {
      clearInterval(timer);
    };
  }, [path]);

  return result;     // trả thẳng dữ liệu (null nếu chưa tải xong)
}

// 4. Bộ lọc → chuỗi địa chỉ
export function toQuery(filters) {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(filters)) {
    if (value !== "" && value !== undefined) query.set(name, String(value));
  }
  return query.toString();
}