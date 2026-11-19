// ===================================================================
// TRANG PROFILE: thông tin sinh viên + các liên kết. Không gọi API nào.
// ===================================================================
import { IconUserAvatar } from "../common";

// Muốn đổi tên, MSSV hay liên kết thì sửa ngay ở đây
const STUDENT_PROFILE = {
  fullName: "Nguyễn Trung Nghĩa",
  studentId: "B23DCAT211",
  group: "13",
  links: [
    {
      title: "Figma",
      desc: "https://www.figma.com/design/Q142HeQDCmSJKCGBhen3nH/Untitled?node-id=0-1&t=a30Ba2izMMXob8lO-1",
      url: "https://www.figma.com/design/Q142HeQDCmSJKCGBhen3nH/Untitled?node-id=0-1&t=a30Ba2izMMXob8lO-1",
      buttonText: "Mở liên kết",
    },
    {
      title: "Báo cáo PDF",
      desc: "Báo cáo bài thực hành 1 - IoT và Ứng dụng.pdf",
      url: "/Bao-cao-bai-thuc-hanh-1-IoT.pdf",
      buttonText: "Mở liên kết",
    },
    {
      title: "GitHub",
      desc: "https://github.com/ZhenithNT/smart-classroom-iot",
      url: "https://github.com/ZhenithNT/smart-classroom-iot",
      buttonText: "Mở liên kết",
    },
  ],
};

export default function Profile() {
  const { fullName, studentId, group, links } = STUDENT_PROFILE;

  function openLink(url) {
    if (url && url !== "#") window.open(url, "_blank", "noopener,noreferrer");
    else alert("Tài liệu này sẽ được bổ sung sau!");
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Hồ sơ cá nhân</h1>
      </div>

      <div className="profile-layout">
        {/* Bên trái: thông tin sinh viên */}
        <div className="profile-student-card">
          <div className="avatar-wrapper">
            <IconUserAvatar />
          </div>
          <h3 className="student-card-title">Thông tin sinh viên</h3>
          <div className="student-name">{fullName}</div>
          <div className="student-detail">
            <span className="detail-label">MSSV: </span>
            <span className="detail-value">{studentId}</span>
          </div>
          <div className="student-detail">
            <span className="detail-label">Nhóm: </span>
            <span className="detail-value">{group}</span>
          </div>
        </div>

        {/* Bên phải: các thẻ liên kết */}
        <div className="profile-links-grid">
          {links.map((item) => (
            <div key={item.title} className="link-card">
              <div>
                <h3 className="link-card-title">{item.title}</h3>
                <p className="link-card-desc">{item.desc}</p>
              </div>
              <button
                className="btn-open-link"
                onClick={() => openLink(item.url)}
              >
                {item.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
