// Cấu hình công cụ build giao diện (Vite): npm run build → thư mục dist/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
