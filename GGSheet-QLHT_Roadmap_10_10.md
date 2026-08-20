# ROADMAP NÂNG CẤP GGSheet-QLHT LÊN 10/10

**Repository:** https://github.com/haiyenpa25/GGSheet-QLHT  
**Nền tảng:** Google Apps Script + Google Sheets  
**Ngày:** 2026-08-20

## 1. Mục tiêu

Mục tiêu không phải chỉ là thêm nhiều tính năng, mà là nâng hệ thống đồng đều theo 4 trục:

1. Nghiệp vụ hoàn chỉnh.
2. Bảo mật tốt.
3. Hiệu năng cao.
4. Trải nghiệm vận hành tốt.

Chuẩn mục tiêu:

```text
Security
+ Performance
+ Data Integrity
+ Workflow
+ Reporting
+ Mobile UX
= 10/10
```

## 2. Security hoàn chỉnh

Cần triển khai:

- Đăng nhập thực sự.
- Session.
- Role.
- Permission.
- Scope theo Hội Thánh / Ban Ngành / Tổ.
- Không tin `sheetId` gửi từ client.
- Audit log cho thao tác quan trọng.
- Backup / restore.
- Phân quyền tài chính riêng.

Kiến trúc:

```text
Authentication
        ↓
Session
        ↓
Role
        ↓
Permission
        ↓
Scope
```

### Admin
```text
Toàn quyền
```

### Trưởng Ban
```text
Thành viên
Tổ
Điểm danh
Thăm viếng
Lịch
Báo cáo
```

### Thư ký
```text
Thành viên
Điểm danh
Lịch
```

### Thủ quỹ
```text
Tài chính
```

### Tổ trưởng
```text
Chỉ thành viên Tổ mình
Điểm danh Tổ mình
Thăm viếng Tổ mình
```

## 3. Kiến trúc Apps Script tối ưu

Cần hoàn thành:

- Không full refresh sau CRUD.
- Batch read / batch write.
- API chia theo module.
- Cache + version.
- Lazy load dữ liệu.
- Phân trang tài chính.
- Phân trang thăm viếng.
- Không tải toàn bộ lịch sử điểm danh.
- Logging thời gian thực thi.
- Không `setValue()` trong loop.
- Không `setupDatabase()` mỗi lần load.

Kiến trúc mục tiêu:

```text
Lưu bản ghi
→ tìm đúng dòng
→ ghi 1 lần bằng setValues()
→ trả record vừa lưu
→ cập nhật state frontend
→ render đúng module
```

## 4. Hồ sơ Ban viên 360°

Mỗi Ban viên nên có:

```text
Nguyễn Văn A
│
├── Thông tin cá nhân
├── Tổ hiện tại
├── Chức vụ
├── Lịch sử tham gia
├── Điểm danh
├── Tỷ lệ chuyên cần
├── Thuộc câu gốc
├── Thăm viếng
├── Nhu cầu cầu nguyện
├── Sinh nhật
├── Ghi chú chăm sóc
└── Timeline hoạt động
```

Nên bổ sung:

- Avatar.
- QR cá nhân.
- Ngày gia nhập Ban.
- Ngày chuyển tổ.
- Lịch sử chức vụ.
- Người chăm sóc.
- Trạng thái chăm sóc.

## 5. Workflow chăm sóc

Không chỉ:

```text
Vắng
→ cảnh báo
```

Mà phải:

```text
Vắng nhiều
   ↓
Tạo Case chăm sóc
   ↓
Giao Tổ trưởng
   ↓
Deadline
   ↓
Liên hệ / thăm
   ↓
Kết quả
   ↓
Tái thăm nếu cần
   ↓
Đóng Case
```

Mỗi Case nên có:

```text
memberId
reason
priority
assignedTo
status
deadline
lastContactAt
nextFollowUpAt
result
note
```

Trạng thái:

```text
Chưa xử lý
Đang theo dõi
Đã xử lý
Cần tái thăm
Đóng
```

Priority:

```text
Bình thường
Quan tâm
Khẩn cấp
```

## 6. Điểm danh nâng cấp

Nên dùng:

```text
Có mặt
Vắng phép
Vắng không phép
Đi trễ
```

Bổ sung:

```text
lyDoVang
gioDen
ghiChu
```

Hệ thống nên tính:

```text
Tỷ lệ chuyên cần 4 tuần
Tỷ lệ chuyên cần 12 tuần
Tỷ lệ chuyên cần 6 tháng
Vắng liên tục
Đi trễ nhiều
```

Dashboard nên cảnh báo:

```text
Vắng 2 tuần liên tục
Vắng 3/4 tuần gần nhất
Đi trễ 3 lần trong tháng
```

## 7. Dashboard phục vụ lãnh đạo

Dashboard phải giúp trả lời:

- Ban viên tăng hay giảm?
- Tổ nào đang yếu?
- Ai đang vắng nhiều?
- Bao nhiêu Case chưa xử lý?
- Tỷ lệ chuyên cần tháng này?
- Sinh nhật nào sắp tới?
- Thu / chi tháng này?
- Quỹ còn bao nhiêu?
- Hoạt động nào sắp diễn ra?

Ví dụ:

```text
BAN THANH TRÁNG
────────────────────

154 Ban viên
↑ +7 so với đầu năm

Điểm danh tuần:
82%

4 người vắng ≥ 3 tuần
🔴 cần xử lý

6 sinh nhật trong 7 ngày tới

Thăm viếng:
12 chưa hoàn tất

Thu tháng này:
12.500.000

Chi tháng này:
8.200.000

Số dư:
35.600.000
```

Thêm biểu đồ:

```text
Chuyên cần 12 tuần
Tăng trưởng Ban viên
Thăm viếng theo tháng
Thu / chi theo tháng
```

## 8. Dashboard theo vai trò

### Trưởng Ban
Xem toàn Ban Ngành.

### Thư ký
- Thành viên.
- Điểm danh.
- Lịch.
- Báo cáo.

### Thủ quỹ
- Thu.
- Chi.
- Quỹ.
- Chứng từ.
- Báo cáo tài chính.

### Tổ trưởng
Chỉ thấy:

```text
Tổ mình
Thành viên tổ mình
Điểm danh tổ mình
Người cần thăm
Sinh nhật
Việc được giao
```

## 9. Report Center

### Báo cáo Ban viên
- Theo tổ.
- Theo độ tuổi.
- Nam / Nữ.
- Theo trạng thái.
- Ban viên mới.
- Ban viên chưa có tổ.

### Báo cáo điểm danh
- Theo tuần.
- Theo tháng.
- Theo quý.
- Theo tổ.
- Theo cá nhân.
- Vắng liên tục.
- Tỷ lệ chuyên cần.

### Báo cáo chăm sóc
- Số lượt thăm.
- Case chưa xử lý.
- Case quá hạn.
- Tổ có nhiều trường hợp cần chăm sóc.

### Báo cáo tài chính
- Thu.
- Chi.
- Theo quỹ.
- Theo hạng mục.
- Theo tháng / quý / năm.

### Output
- Excel.
- PDF.
- Print.

## 10. CRM Thân hữu

Tạo module riêng:

```text
ThanHuu
```

Schema gợi ý:

```text
id
hoTen
sdt
nguoiGioiThieu
ngayLanDau
toPhuTrach
trangThai
ghiChu
createdAt
updatedAt
```

Lifecycle:

```text
Khách mới
→ Thân hữu
→ Đang tìm hiểu
→ Tin Chúa
→ Học giáo lý
→ Báp-tem
→ Ban viên
```

## 11. Tân tín hữu

Workflow:

```text
Thân hữu
   ↓
Tin Chúa
   ↓
Tân tín hữu
   ↓
Học giáo lý
   ↓
Báp-tem
   ↓
Ban viên
```

Checklist:

```text
☐ Được liên hệ
☐ Có người chăm sóc
☐ Có tổ
☐ Bắt đầu giáo lý
☐ Hoàn tất giáo lý
☐ Báp-tem
☐ Chính thức vào Ban
```

## 12. Lịch + phân công nhân sự

Nâng `LichQuy` thành:

```text
Chương trình
├── Hướng dẫn
├── Diễn giả
├── Cầu nguyện
├── Piano
├── Organ
├── Guitar
├── Trống
├── Âm thanh
├── Trình chiếu
└── Tiếp tân
```

Trạng thái:

```text
Chưa xác nhận
Đã xác nhận
Cần thay thế
```

## 13. Hoạt động / Event

Tạo module:

```text
HoatDong
```

Phục vụ:

- Thông công.
- Dã ngoại.
- Trại.
- Giáng Sinh.
- Truyền giảng.
- Chuyên đề.
- Sinh hoạt đặc biệt.

Mỗi hoạt động có:

```text
Tên
Thời gian
Địa điểm
Người phụ trách
Ngân sách
Danh sách đăng ký
Danh sách tham gia
Phân công
Check-in
Ghi chú
```

## 14. Notification Center

Ví dụ:

```text
🔴 4 người vắng ≥ 3 tuần
🟠 3 case chăm sóc quá hạn
🎂 5 sinh nhật trong tuần
📅 Tổ 2 phụ trách Chúa nhật tới
💰 2 giao dịch chưa có chứng từ
👤 6 thành viên chưa có tổ
```

Phân loại:

```text
Info
Warning
Critical
```

## 15. Mẫu tin nhắn

Biến động:

```text
{{hoTen}}
{{tenTo}}
{{ngaySinh}}
{{chuDe}}
{{ngayNhom}}
{{nguoiPhuTrach}}
```

Luồng:

```text
Chọn người
→ chọn mẫu
→ tự điền dữ liệu
→ preview
→ mở Zalo / SMS / email
```

## 16. Tài chính

Chỉ nên quản lý:

- Thu.
- Chi.
- Quỹ.
- Hạng mục.
- Chứng từ.
- Người thực hiện.
- Báo cáo.
- Audit.

Không nên biến hệ thống thành phần mềm kế toán.

## 17. Audit Log

Tạo:

```text
AuditLog
```

Schema:

```text
id
timestamp
userId
action
module
recordId
beforeData
afterData
sessionId
```

Audit bắt buộc cho:

- Finance.
- Users.
- Permission.
- Member delete.
- Bulk import.
- Settings.

## 18. Master Dashboard toàn Hội Thánh

Ví dụ:

```text
HỘI THÁNH
─────────────────────

Ban Thanh Tráng
154 người
Điểm danh: 82%

Ban Thanh Niên
82 người
Điểm danh: 74%

Ban Thiếu Nhi
120 người
Điểm danh: 91%

Ban Phụ Nữ
95 người
Điểm danh: 78%
```

Không mở từng Spreadsheet mỗi lần tải.

Tạo bảng snapshot:

```text
BanNganhStats
```

Schema:

```text
banNganhId
totalMembers
attendanceRate
absentWarnings
activeCases
balance
lastUpdatedAt
```

## 19. QR Check-in

Mỗi Ban viên có QR riêng.

Ứng dụng:

```text
Điểm danh
Tra cứu hồ sơ
Check-in hoạt động
```

Luồng:

```text
Camera
 ↓
Quét QR
 ↓
Nguyễn Văn A
Tổ 2

[ Có mặt ]
```

## 20. PWA / Mobile-first

Phát triển:

```text
Web App
+
PWA
```

Yêu cầu:

- Add to Home Screen.
- Responsive tốt.
- Camera QR.
- Nút lớn khi điểm danh.
- Thăm viếng nhanh.
- Gọi / Zalo một chạm.
- Cache static assets.
- Loading skeleton.
- Offline shell.

## 21. Data Integrity

Bắt buộc:

- Unique ID.
- Không duplicate member.
- Không duplicate attendance.
- Validate phone.
- Validate date.
- Validate amount.
- Soft delete cho dữ liệu quan trọng.
- `createdAt`.
- `createdBy`.
- `updatedAt`.
- `updatedBy`.
- Schema version.

Không dùng tên người làm khóa nghiệp vụ.

## 22. Backup & Restore

Ví dụ:

```text
/Backup
   /2026
      QLHT_2026-08-20
      BanThanhTrang_2026-08-20
```

Chiến lược lưu:

```text
7 ngày
4 tuần
12 tháng
```

Nên có:

- Backup thủ công.
- Backup tự động.
- Restore test.
- Nhật ký backup.

## 23. Testing

CRUD Member:

```text
✓ Create
✓ Update
✓ Delete
✓ Duplicate
✓ Missing fields
✓ Permission
✓ Mobile
```

Performance test:

```text
100 members
500 members
1.000 members
10.000 attendance records
50.000 attendance records
```

Theo dõi:

- Thời gian load.
- Thời gian CRUD.
- Số Spreadsheet calls.
- Payload JSON.
- Số lần full refresh.
- Lock timeout.

## 24. Documentation

Repo nên có:

```text
docs/
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── SECURITY.md
├── PERMISSIONS.md
├── DEPLOYMENT.md
├── TESTING.md
└── CHANGELOG.md
```

README phải phản ánh đúng source code thực tế.

## 25. Chấm điểm mục tiêu

| Nhóm | Điểm |
|---|---:|
| Nghiệp vụ Ban viên / Tổ | 1.5 |
| Điểm danh & chăm sóc | 1.5 |
| Lịch / Hoạt động | 1.0 |
| Báo cáo / Dashboard | 1.0 |
| Security / Permission | 1.5 |
| Performance / Architecture | 1.5 |
| Audit / Data Integrity | 0.75 |
| Mobile / PWA / UX | 0.75 |
| **Tổng** | **10/10** |

## 26. Roadmap triển khai

### PHASE 1 — Nền móng

```text
Security
+ Performance
+ Data Integrity
```

Ưu tiên:

1. Authentication.
2. Session.
3. Role.
4. Permission.
5. Scope.
6. Audit.
7. Tối ưu Apps Script.
8. Schema version.
9. Validate dữ liệu.
10. Backup cơ bản.

### PHASE 2 — Nghiệp vụ cốt lõi

```text
Member 360
+ Care Workflow
+ Attendance
```

Ưu tiên:

1. Hồ sơ Ban viên 360°.
2. Case chăm sóc.
3. Giao việc chăm sóc.
4. Trạng thái điểm danh mở rộng.
5. Cảnh báo vắng.
6. Timeline thành viên.

### PHASE 3 — Quản trị

```text
Dashboard
+ Reports
+ Role Dashboard
```

Ưu tiên:

1. Dashboard Ban Ngành.
2. Dashboard Tổ trưởng.
3. Master Dashboard.
4. Report Center.
5. Export Excel / PDF.

### PHASE 4 — Mở rộng nghiệp vụ

```text
Thân hữu
+ Tân tín hữu
+ Activities
```

Ưu tiên:

1. CRM Thân hữu.
2. Tân tín hữu.
3. Hoạt động / Event.
4. Phân công chương trình.
5. Mẫu tin nhắn.

### PHASE 5 — Trải nghiệm

```text
PWA
+ QR
+ Notifications
+ Automation
```

Ưu tiên:

1. PWA.
2. QR Check-in.
3. Notification Center.
4. Nhắc sinh nhật.
5. Nhắc vắng.
6. Nhắc lịch phụ trách.

### PHASE 6 — Chuẩn hóa

```text
QA
+ Backup
+ Documentation
```

Ưu tiên:

1. Test checklist.
2. Performance benchmark.
3. Backup restore test.
4. Tài liệu kiến trúc.
5. Tài liệu API.
6. Changelog.

## 27. 5 việc quan trọng nhất cần làm ngay

```text
1. Authentication + Permission
2. Tối ưu Apps Script
3. Audit Log
4. Hồ sơ Ban viên 360°
5. Workflow chăm sóc
```

Không nên triển khai 20 tính năng cùng lúc.

Hoàn thành 5 phần này trước sẽ tạo nền móng tốt cho tất cả phần còn lại.

## 28. Kiến trúc mục tiêu cuối cùng

```text
             QLHT MASTER
                  │
      ┌───────────┼───────────┐
      │           │           │
   Hội Thánh    Hội Thánh    Hội Thánh
      │
      ├──────────────────────────────┐
      │                              │
  BAN NGÀNH                      DASHBOARD
      │
      ├── Thành viên
      │      │
      │      └── Hồ sơ 360°
      │
      ├── Tổ nhóm
      │
      ├── Điểm danh
      │
      ├── Chăm sóc
      │      ├── Cảnh báo
      │      ├── Thăm viếng
      │      └── Task
      │
      ├── Thân hữu
      │
      ├── Tân tín hữu
      │
      ├── Hoạt động
      │
      ├── Lịch & phân công
      │
      ├── Chủ đề / câu gốc
      │
      ├── Tài chính
      │
      ├── Tin nhắn
      │
      ├── Báo cáo
      │
      └── Audit
```

## 29. Kết luận

Để đạt 10/10, không cần bỏ Google Sheets ngay.

Hướng đúng là:

```text
Giữ Google Apps Script + Google Sheets
        ↓
Tối ưu kiến trúc
        ↓
Hoàn thiện Security
        ↓
Chuẩn hóa dữ liệu
        ↓
Khép kín workflow chăm sóc
        ↓
Bổ sung Reporting
        ↓
Mobile/PWA
        ↓
Automation
```

Hệ thống 10/10 không phải hệ thống có nhiều chức năng nhất, mà là hệ thống:

- Nhanh.
- Bảo mật.
- Dễ dùng.
- Dữ liệu đáng tin.
- Có workflow rõ ràng.
- Có báo cáo để ra quyết định.
- Có khả năng mở rộng mà không phá kiến trúc.
