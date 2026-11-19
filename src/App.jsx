import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import {
  IconLogo,
  IconDashboard,
  IconSensor,
  IconAlert,
  IconHistory,
  IconProfile,
  IconLogout,
} from "./common";
import { getToken } from "./api";
import Login, { logout } from "./pages/auth";
import Dashboard from "./pages/dashboard";
import SensorTable from "./pages/sensorTable";
import Alert from "./pages/alerts";
import HistoryTable from "./pages/historyTable";
import Profile from "./pages/profile";

// Thanh menu bên trái. Muốn thêm trang: thêm 1 dòng vào MENU và 1 dòng {tab === "..." && ...}
const MENU = [
  { id: "dashboard", label: "Dashboard", Icon: IconDashboard },
  { id: "sensor", label: "Data Sensor", Icon: IconSensor },
  { id: "alert", label: "Cảnh báo", Icon: IconAlert },
  { id: "history", label: "History Action", Icon: IconHistory },
  { id: "profile", label: "Profile", Icon: IconProfile },
];

// Chưa có token → màn hình Login; có token → màn hình chính
function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(getToken()));

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;
  return <MainScreen />;
}

function MainScreen() {
  const [tab, setTab] = useState("dashboard");   // đang xem trang nào

  return (
    <div className="app-container">
      <Sidebar currentTab={tab} setTab={setTab} />

      <main className="main-content">
        {tab === "dashboard" && <Dashboard />}
        {tab === "sensor" && <SensorTable />}
        {tab === "alert" && <Alert />}
        {tab === "history" && <HistoryTable />}
        {tab === "profile" && <Profile />}
      </main>
    </div>
  );
}

function Sidebar({ currentTab, setTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <IconLogo />
        <span className="logo-text">IOT System</span>
      </div>

      <nav className="sidebar-menu">
        {MENU.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={"menu-item " + (currentTab === id ? "active" : "")}
            onClick={() => setTab(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <button className="menu-item logout-button" onClick={logout}>
        <IconLogout />
        <span>Đăng xuất</span>
      </button>
    </aside>
  );
}

// Vẽ web vào thẻ <div id="root"> trong index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);