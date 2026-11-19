import { useState } from "react";
import { callApi, useApi } from "../api";
import { IconBulb, IconFan } from "../common";

export default function DeviceControl() {
  const [submitting, setSubmitting] = useState(false);   // đang gửi lệnh tới backend

  // 1. Tải trạng thái Đèn, Quạt
  const devicesApi = useApi("/devices", 1000);
  const devices = [];
  for (const device of devicesApi?.data || []) {
    devices.push({
      id: device.id,
      name: device.name,
      status: device.status === "ON",   // chữ "ON" → true, chữ "OFF" → false
    });
  }

  // 2. Lệnh mới nhất còn đang chờ → thiết bị đó là "đang xử lý".
  // Hỏi mỗi 1 giây để chữ "Đang xử lý…" hiện nhanh sau khi bấm.
  const lastActionApi = useApi("/actions?limit=1", 1000);
  const lastAction = lastActionApi?.data?.[0];
  let pendingId = null;                         // mặc định: không có lệnh nào đang chờ
  if (lastAction && lastAction.status === "PENDING") {
    pendingId = lastAction.deviceId;            // nhớ thiết bị nào đang chờ
  }
  const disabled = submitting || pendingId !== null;

  // 3. Bấm công tắc: gửi lệnh bật nếu đang tắt, tắt nếu đang bật
  async function toggle(device) {
    setSubmitting(true);
    try {
      await callApi(`/devices/${device.id}/actions`, {
        method: "POST",
        body: JSON.stringify({ action: device.status ? "TURN_OFF" : "TURN_ON" }),
      });
    } catch (error) {
      // Gửi lỗi (ví dụ MQTT mất kết nối): lần tải sau sẽ hiện trạng thái thật
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="device-control-card">
      <div className="control-title">Điều khiển thiết bị</div>
      <div className="device-list">
        {devices.map((device) => (
          <DeviceItem
            key={device.id}
            device={device}
            isPending={pendingId === device.id}
            onToggle={() => toggle(device)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

function DeviceItem({ device, isPending, onToggle, disabled }) {
  const isBulb = device.id === 1; // thiết bị số 1 là Đèn, số 2 là Quạt

  // Đang xử lý: công tắc hiện trạng thái mong muốn.
  // Nếu lệnh thất bại, pending biến mất và công tắc tự về trạng thái cũ.
  const shownStatus = isPending ? !device.status : device.status;
  const boxClass = (isBulb ? "bulb-" : "fan-") + (shownStatus ? "on" : "off");

  let statusText = device.status ? "Đang bật" : "Đang tắt";
  if (isPending) statusText = "Đang xử lý…";

  return (
    <div className="device-item">
      <div className="device-left">
        <div className={"device-icon-box " + boxClass}>
          {isBulb ? <IconBulb on={shownStatus} /> : <IconFan on={shownStatus} />}
        </div>
        <div className="device-meta">
          <span className="device-name">{device.name}</span>
          <span className={"device-status " + (isPending ? "status-processing" : "")}>
            {statusText}
          </span>
        </div>
      </div>

      <label className={"switch " + (disabled ? "disabled" : "")}>
        <input
          type="checkbox"
          aria-label={device.name}
          checked={shownStatus}
          disabled={disabled}
          onChange={onToggle}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}