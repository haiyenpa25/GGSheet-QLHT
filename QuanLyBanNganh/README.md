# PHẦN MỀM QUẢN LÝ BAN THANH TRÁNG (GOOGLE APPS SCRIPT + GOOGLE SHEETS)

Hệ thống quản lý Ban Thanh Tráng toàn diện trên nền tảng **Google Apps Script (GAS)**, sử dụng **Google Sheets** làm cơ sở dữ liệu (Database), giao diện **Glassmorphism Deep Space** cao cấp, module hóa theo phong cách Lập trình hướng đối tượng (OOP).

---

## 🌟 1. Danh Sách Màn Hình & Tính Năng Đã Triển Khai

| Màn hình | Tên Module | Tính năng chính |
| :--- | :--- | :--- |
| **Đăng Nhập** | `view_login_html.html` | Đăng nhập tài khoản, mật khẩu (SHA-256), ghi nhớ phiên, nút đăng nhập nhanh (admin, truongban, thuky). |
| **Dashboard** | `view_dashboard_html.html` | Thống kê 4 KPI (Ban viên, Cảnh báo vắng, Sinh nhật tháng, Số tổ), Biểu đồ điểm danh 4 tuần, Cảnh báo vắng & nút tạo lượt thăm khẩn cấp. |
| **Ban Viên** | `view_members_html.html` | Tìm kiếm tức thì, Carousel sinh nhật tháng, Lọc theo tổ/trạng thái, Thẻ ban viên, Popup Thêm/Sửa/Xóa ban viên. |
| **Quản Lý Tổ** | `view_groups_html.html` | Lưới thẻ Bento từng tổ, gán Tổ trưởng/Tổ phó, Lịch sinh hoạt, Địa điểm, Sĩ số thành viên, Popup Thêm/Sửa tổ. |
| **Điểm Danh** | `view_attendance_html.html` | Lọc Năm/Quý/Ngày nhóm, Phân tổ, 2 Toggle switch kính (Có mặt - Xanh lá, Câu gốc - Xanh dương), Thống kê sĩ số trực tiếp, Nút Lưu điểm danh. |
| **Thăm Viếng** | `view_visitations_html.html` | Dòng thời gian (Timeline) chăm sóc, lọc hình thức (Trực tiếp, Điện thoại, Tin nhắn), Popup ghi nhận lượt thăm, Nhu cầu cầu nguyện & Kết quả. |
| **Lịch Quý** | `view_schedule_html.html` | Kế hoạch 13 tuần trong quý, Thẻ chi tiết từng tuần (Chủ đề, Kinh thánh, Diễn giả, Tổ phụ trách, HD/CN), Hiệu ứng Active Glow tuần hiện tại, In A4. |
| **Chủ Đề** | `view_themes_html.html` | Banner chủ đề năm (Hero Card), Thẻ chủ đề 4 Quý (Q1..Q4), Mục tiêu tâm linh và Khẩu hiệu hành động. |
| **Cài Đặt** | `view_settings_html.html` | Quản lý User (Tạo mới, Phân quyền Admin/Trưởng ban/Thư ký/Tổ trưởng, Xóa), Kết nối Google Spreadsheet ID, Nạp dữ liệu mẫu (Seed Data) & Reset DB. |

---

## 📁 2. Cấu Trúc File Dự Án (Module Hóa & OOP)

```text
BanThanhTrang/
├── .clasp.json                   # Cấu hình Script ID kết nối Google Apps Script
├── appsscript.json               # Manifest Web App (Timezone Asia/Ho_Chi_Minh)
│
├── backend/                      # Backend Google Apps Script (OOP)
│   ├── Config.gs                 # Định nghĩa Hằng số, Schema cấu trúc Sheets, Roles
│   ├── SheetDB.gs                # Lớp Mini-ORM thao tác CRUD Google Spreadsheet
│   ├── AuthModel.gs              # Quản lý tài khoản, mã hóa SHA-256, phân quyền
│   ├── MemberModel.gs            # Model & Logic xử lý Ban Viên
│   ├── GroupModel.gs             # Model & Logic xử lý Tổ & Nhóm nhỏ
│   ├── AttendanceModel.gs        # Model & Logic Điểm danh, Thống kê, Cảnh báo vắng
│   ├── VisitModel.gs             # Model & Logic Nhật ký thăm viếng
│   ├── ScheduleModel.gs          # Model & Logic Lịch quý 13 tuần
│   ├── ThemeModel.gs             # Model & Logic Chủ đề năm/quý
│   ├── SettingModel.gs           # Cấu hình hệ thống & Khởi tạo dữ liệu mẫu
│   ├── AppController.gs          # Cổng API duy nhất điều phối request (apiCall)
│   └── Code.gs                   # Entry point doGet(e) & hàm include()
│
├── frontend/                     # Giao diện & Client Scripts
│   ├── index.html                # Master SPA Layout, Navigation, TopAppBar, Modals
│   ├── styles_css.html           # Tailwind CDN config, Glassmorphism, Custom Toggles
│   ├── api_client_js.html        # Client API (Promise wrapper cho google.script.run + Mock Mode)
│   ├── app_core_js.html          # State Management, Router, Toast, Modal controls
│   ├── view_login_html.html      # Giao diện Đăng nhập
│   ├── view_dashboard_html.html  # Giao diện Dashboard
│   ├── view_members_html.html    # Giao diện Ban viên
│   ├── view_groups_html.html     # Giao diện Quản lý tổ
│   ├── view_attendance_html.html # Giao diện Điểm danh
│   ├── view_visitations_html.html# Giao diện Thăm viếng
│   ├── view_schedule_html.html   # Giao diện Lịch quý
│   ├── view_themes_html.html     # Giao diện Chủ đề
│   └── view_settings_html.html   # Giao diện Cài đặt
│
└── preview_app.html              # File xem thử tương tác độc lập (Chạy trực tiếp trên trình duyệt)
```

---

## 📊 3. Cách Tạo & Kết Nối File Google Sheet Mới Tinh

Hệ thống cung cấp **3 cách cực kỳ dễ dàng** để tạo một file Google Sheet mới tinh làm cơ sở dữ liệu:

### Cách 1: Bấm Nút Tạo Trực Tiếp Trong Web App (Khuyên dùng - Nhanh nhất)
1. Mở Web App, vào menu **Cài Đặt** -> Chọn tab **Cấu Hình Google Sheet & Dữ Liệu**.
2. Bấm nút màu xanh lá **"➕ Tạo Google Sheet Mới Tự Động"**.
3. Nhập tên file mong muốn (ví dụ: `DB_BanThanhTrang_2024`).
4. Hệ thống sẽ **tự động tạo file Sheet mới trên Google Drive của bạn**, tạo sẵn toàn bộ 8 bảng với màu sắc tiêu đề đẹp mắt, nạp sẵn dữ liệu demo và tự động mở file Sheet mới lên cho bạn xem!

### Cách 2: Chạy Hàm `setupNewDatabase()` Trong Script Editor
1. Mở Google Apps Script Editor (`clasp open` hoặc qua link script).
2. Tại thanh công cụ phía trên, chọn hàm **`setupNewDatabase`**.
3. Nhấn nút **Run (Chạy)**.
4. Mở tab **Execution log (Nhật ký thực thi)** để xem đường link mở file Google Sheet mới vừa được tạo.

### Cách 3: Nhập ID Của 1 File Google Sheet Có Sẵn
1. Nếu bạn tự tạo 1 file Google Sheet trống trên Google Drive của mình, hãy copy chuỗi ID từ đường link URL (phần nằm giữa `/d/` và `/edit`).
2. Vào mục **Cài Đặt** trong Web App -> Dán ID vào ô **Google Spreadsheet ID** -> Nhấn **Lưu Kết Nối**.
3. Bấm **"Khởi Tạo & Nạp Dữ Liệu Mẫu"** để hệ thống tự động sinh cấu trúc cột và dữ liệu ban đầu.

---

## 🔑 4. Tài Khoản Mặc Định

| Tên Đăng Nhập | Mật Khẩu | Vai Trò |
| :--- | :--- | :--- |
| `admin` | `123456` | Quản trị viên (Toàn quyền hệ thống) |
| `truongban` | `123456` | Trưởng ban |
| `thuky` | `123456` | Thư ký |
