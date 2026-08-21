---
title: "GGSheet-QLHT — Master Architecture & Implementation Specification"
subtitle: "Đặc tả hợp nhất dành cho Antigravity"
repository: "https://github.com/haiyenpa25/GGSheet-QLHT"
platform: "Google Apps Script + Google Sheets + GitHub Pages"
architecture: "Monorepo + Serverless + Multi-Church + Multi-Ministry + Shared Engine"
target_agent: "Antigravity"
version: "2.0"
status: "Nguồn đặc tả chuẩn để triển khai"
date: "2026-08-21"
language: "vi"
---

# GGSheet-QLHT — MASTER SPECIFICATION DÀNH CHO ANTIGRAVITY

> **MỤC ĐÍCH CỦA FILE NÀY**
>
> Đây là tài liệu hợp nhất và thay thế vai trò chỉ đạo triển khai của các tài liệu rời trước đây về:
>
> - tối ưu hiệu năng Google Apps Script;
> - hướng dẫn vận hành Hội Thánh → Ban Ngành → Google Sheet;
> - roadmap nâng cấp hệ thống lên mức 10/10;
> - kiến trúc Serverless + GitHub Pages;
> - kiến trúc nhiều Hội Thánh, mỗi Hội Thánh có nhiều Ban Ngành;
> - chuẩn hóa repo, cấu hình, deploy, bảo mật, dữ liệu, báo cáo và kiểm thử.
>
> Antigravity **không được triển khai máy móc theo tài liệu cũ nếu có điểm xung đột với file này**.  
> File này là **nguồn định hướng kiến trúc ưu tiên cao nhất**. Tuy nhiên, trước khi sửa code, Antigravity phải kiểm tra source code thực tế trong repository và ghi nhận mọi khác biệt.

---

# 0. EXECUTIVE SUMMARY

Hệ thống cần được chuẩn hóa theo mô hình:

```text
MỘT GITHUB REPOSITORY
        │
        ├── QuanLyHoiThanh
        │      └── Master / Registry / Portal / Reporting
        │
        ├── QuanLyBanNganh
        │      └── Shared Ministry Engine
        │
        ├── shared
        │      └── code dùng chung
        │
        ├── scripts
        │      └── deploy / validate / test / scaffold
        │
        ├── docs
        │      └── tài liệu kỹ thuật
        │
        └── GitHub Pages
               └── frontend serverless
```

Mô hình dữ liệu nghiệp vụ:

```text
TOÀN HỆ THỐNG
    │
    ├── HỘI THÁNH A
    │      │
    │      ├── Ban Thanh Tráng
    │      ├── Ban Thanh Niên
    │      ├── Ban Thiếu Nhi
    │      ├── Ban Phụ Nữ
    │      └── ...
    │
    ├── HỘI THÁNH B
    │      │
    │      ├── Ban Thanh Tráng
    │      ├── Ban Thanh Niên
    │      └── ...
    │
    └── HỘI THÁNH C
           └── ...
```

Nguyên tắc kiến trúc quan trọng nhất:

> **Hội Thánh và Ban Ngành là DATA TENANT, không phải bản sao CODE.**

Nói cách khác:

- Có thể có 2, 10, 50 Hội Thánh.
- Mỗi Hội Thánh có thể có nhiều Ban Ngành.
- Mỗi Ban Ngành có Google Sheet database riêng.
- Nhưng **không tạo một bản copy source code cho từng Hội Thánh hoặc từng Ban Ngành**.
- Tất cả Ban Ngành dùng chung một `QuanLyBanNganh Engine`.
- Master chịu trách nhiệm biết:
  - Ban nào thuộc Hội Thánh nào;
  - Ban đó dùng Spreadsheet nào;
  - người dùng được phép truy cập phạm vi nào;
  - snapshot báo cáo của từng Ban;
  - các thông tin phục vụ dashboard Hội Thánh và dashboard toàn hệ thống.

Kiến trúc mục tiêu:

```text
                    GGSheet-QLHT
                         │
          ┌──────────────┴──────────────┐
          │                             │
   QuanLyHoiThanh                QuanLyBanNganh
       MASTER                    SHARED ENGINE
          │                             │
          └──────────────┬──────────────┘
                         │
                   MASTER REGISTRY
                         │
          ┌──────────────┼──────────────┐
          │              │              │
        HT001          HT002          HT003
          │              │
     ┌────┼────┐      ┌──┼──┐
     │    │    │      │  │  │
    BTT  BTN  BTNHI   BTT BTN ...
     │    │    │
     ▼    ▼    ▼
   Sheet Sheet Sheet
```

---

# 1. MỤC TIÊU TỔNG THỂ

Hệ thống phải đạt đồng thời 7 trục:

```text
Architecture
+ Security
+ Performance
+ Data Integrity
+ Workflow
+ Reporting
+ Mobile UX
= HỆ THỐNG 10/10
```

## 1.1. Mục tiêu nghiệp vụ

Hệ thống phải hỗ trợ:

1. Nhiều Hội Thánh độc lập.
2. Mỗi Hội Thánh có nhiều Ban Ngành.
3. Mỗi Ban Ngành có dữ liệu riêng.
4. Báo cáo được theo:
   - Ban Ngành;
   - Hội Thánh;
   - toàn hệ thống.
5. Phân quyền được theo:
   - toàn hệ thống;
   - Hội Thánh;
   - Ban Ngành;
   - Tổ.
6. Có khả năng mở rộng thêm module phần mềm mới mà không phá kiến trúc hiện tại.

## 1.2. Mục tiêu kỹ thuật

- 100% serverless ở giai đoạn hiện tại.
- Google Apps Script làm backend.
- Google Sheets làm database.
- Google Drive quản lý database và tài liệu.
- GitHub lưu toàn bộ source code.
- GitHub Pages làm frontend miễn phí.
- Vẫn hỗ trợ chạy trực tiếp trên Apps Script Web App.
- Không cần VPS/database server ở giai đoạn hiện tại.
- Có thể migrate sang database khác sau này mà không phải viết lại toàn bộ business logic.

---

# 2. THUẬT NGỮ CHUẨN

Antigravity phải sử dụng nhất quán các thuật ngữ sau.

| Thuật ngữ | Ý nghĩa |
|---|---|
| `System` | Toàn bộ GGSheet-QLHT |
| `Church` / `HoiThanh` | Một Hội Thánh độc lập |
| `Ministry` / `BanNganh` | Một Ban Ngành trực thuộc một Hội Thánh |
| `Group` / `ToNhom` | Tổ nhỏ thuộc Ban Ngành |
| `Master` | Hệ thống quản lý registry, Hội Thánh, Ban Ngành, user, scope, snapshot |
| `Ministry Engine` | Code dùng chung để vận hành mọi Ban Ngành |
| `Tenant` | Đối tượng dữ liệu độc lập |
| `churchId` | ID hệ thống của Hội Thánh |
| `ministryId` | ID hệ thống của Ban Ngành |
| `spreadsheetId` | ID database Google Sheet của Ban Ngành |
| `scope` | Phạm vi dữ liệu user được truy cập |
| `schemaVersion` | Phiên bản cấu trúc dữ liệu |
| `dataVersion` | Phiên bản dữ liệu dùng để cache/sync |
| `deploymentId` | Google Apps Script deployment |
| `project.config.json` | Cấu hình kỹ thuật của một software project/module |

---

# 3. QUYẾT ĐỊNH KIẾN TRÚC BẮT BUỘC

## ADR-001 — Monorepo

Sử dụng **một GitHub repository**:

```text
GGSheet-QLHT
```

Toàn bộ software module nằm trong cùng repository.

### Không được

```text
repo-ban-thanh-trang
repo-ban-thanh-nien
repo-ban-thieu-nhi
...
```

---

## ADR-002 — Một software module có thể là một Apps Script Project

Ví dụ:

```text
QuanLyHoiThanh
QuanLyBanNganh
```

là hai software module thực sự khác nhau.

Sau này có thể thêm:

```text
QuanLyTaiSan
QuanLyLopHoc
ReportCenter
NotificationService
...
```

nếu business logic đủ khác biệt để cần tách.

---

## ADR-003 — Ban Thanh Niên, Ban Thanh Tráng... KHÔNG phải software module

Ví dụ:

```text
Ban Thanh Niên HT001
Ban Thanh Niên HT002
Ban Thanh Tráng HT001
Ban Thanh Tráng HT002
```

là các **tenant** của `QuanLyBanNganh`.

Không tạo:

```text
/BanThanhNien_HT001
/BanThanhNien_HT002
/BanThanhTrang_HT001
...
```

trong source code.

---

## ADR-004 — Mỗi Ban Ngành có Google Sheet database riêng

Ví dụ:

```text
HT001
├── DB_BTT_HT001
├── DB_BTN_HT001
└── DB_BTNHI_HT001

HT002
├── DB_BTT_HT002
├── DB_BTN_HT002
└── DB_BTNHI_HT002
```

Lợi ích:

- dữ liệu tách biệt;
- dễ backup;
- dễ phân quyền Drive;
- giảm kích thước từng Sheet;
- dễ migrate;
- lỗi một Ban không trực tiếp làm hỏng dữ liệu Ban khác.

---

## ADR-005 — Hội Thánh là tenant cấp cao

Quan hệ chuẩn:

```text
HoiThanh
    1
    │
    │ N
BanNganh
    1
    │
    │ N
ToNhom / ThanhVien / ...
```

Mọi Ban Ngành bắt buộc có `churchId`.

---

## ADR-006 — Client không được quyền quyết định Spreadsheet

Tuyệt đối không xây API kiểu:

```javascript
apiGetMembers(spreadsheetId)
```

nếu `spreadsheetId` đến trực tiếp từ client và backend tin giá trị đó.

API phải nhận context nghiệp vụ:

```javascript
{
  churchId: "...",
  ministryId: "..."
}
```

Backend thực hiện:

```text
session
  ↓
permission
  ↓
scope
  ↓
ministryId
  ↓
Master Registry
  ↓
spreadsheetId thật
  ↓
Google Sheet
```

---

## ADR-007 — Báo cáo Hội Thánh không quét tất cả Sheet khi mở Dashboard

Không làm:

```text
Mở Dashboard Hội Thánh
→ mở 10 file Sheet Ban Ngành
→ đọc tất cả dữ liệu
→ tổng hợp
```

Phải dùng snapshot:

```text
BanNganhStats
```

Master Dashboard đọc snapshot từ Master.

---

## ADR-008 — GitHub Pages và GAS Web App dùng chung API contract

Hai chế độ frontend:

```text
Mode A: GAS Web App
Mode B: GitHub Pages
```

không được có hai business logic riêng biệt.

Chỉ khác lớp transport.

---

# 4. CÁC GIÁ TRỊ CẤU HÌNH HIỆN TẠI

## 4.1. QuanLyHoiThanh

Giá trị mục tiêu hiện tại:

```json
{
  "projectKey": "QuanLyHoiThanh",
  "scriptId": "149nnAqnjMjiu8v3XU9KUZzft72mjJyR0rjJWg8HaOdem9QDDYmOyWDc0",
  "spreadsheetId": "124O4hYFaxmZm1hg8FyRP4fci6hw84ziIg8o3eAUwMV0",
  "driveFolderId": "1dy78gH_lwfvPUKaZMRCsiOwN2ZPWcBGj",
  "deploymentId": "AKfycbz7e9ZVchhCfuTs10-ldapfDMl3ZzqlB2jQz7nCsyFpQXzHJk6c2AYvM_qOs9MODZZ8",
  "banNganhWebAppUrl": "https://script.google.com/macros/s/AKfycbyTzZ_cRWo7DUaIb65Y7ihwRYuu7KY5OMvaFfZqQRTvYt1Mjv8LZebFzPbqEkF3jglI/exec"
}
```

## 4.2. QuanLyBanNganh

Giá trị mục tiêu hiện tại:

```json
{
  "projectKey": "QuanLyBanNganh",
  "scriptId": "1tj_RVNqCmRSOz6SL8ygDdLBAUWRfjksiIvHzQmlCVIeIY2uUfHgWjzZq",
  "legacyDefaultSpreadsheetId": "1qI_qFmXjbnnw21qPdxeWSUpBH9itFp6TznpAKMZZwME",
  "deploymentId": "AKfycbyTzZ_cRWo7DUaIb65Y7ihwRYuu7KY5OMvaFfZqQRTvYt1Mjv8LZebFzPbqEkF3jglI",
  "legacyTitle": "Ban Thanh Tráng"
}
```

### Lưu ý cực kỳ quan trọng

`legacyDefaultSpreadsheetId` và `legacyTitle` chỉ được xem là **cấu hình tương thích với mô hình cũ**.

Kiến trúc mới không được khóa `QuanLyBanNganh` vào một Ban cụ thể.

---

# 5. CÁC XUNG ĐỘT ĐÃ PHÁT HIỆN TRONG TÀI LIỆU CŨ

Antigravity phải ghi nhận và xử lý trước khi sửa code.

## 5.1. Master Spreadsheet ID có dấu hiệu khác nhau

Một hướng dẫn cũ có Spreadsheet ID khác ký tự so với giá trị mục tiêu mới.

### Quy tắc

1. Không đoán ID đúng.
2. Kiểm tra:
   - `.clasp.json`;
   - `project.config.json`;
   - Apps Script properties;
   - file đang thực sự được code mở.
3. Giá trị người dùng xác nhận mới nhất là giá trị mục tiêu.
4. Tạo báo cáo `CONFIG_AUDIT.md` trước khi thay đổi production.

---

## 5.2. Danh sách tab Ban Ngành không đồng nhất

Có tài liệu liệt kê:

```text
ThanhVien
ToNhom
DiemDanh
SoQuy
LichQuy
ChuDe
MauTinNhan
DanhMucQuy
CauHinh
Users
```

Trong khi hướng dẫn vận hành khác có:

```text
ThanhVien
ToNhom
DiemDanh
ThamVieng
LichQuy
ChuDe
SoQuy
DanhMucQuy
MauTinNhan
CauHinh
```

### Quyết định chuẩn

`Users` phải được đưa về **Master** để quản lý tập trung authentication/permission.

Ban Ngành core schema phải giữ `ThamVieng`.

Core Ban Ngành:

```text
ThanhVien
ToNhom
DiemDanh
ThamVieng
LichQuy
ChuDe
SoQuy
DanhMucQuy
MauTinNhan
CauHinh
```

Các tab mới sẽ được thêm bằng schema migration theo phase, không thêm tùy tiện.

---

## 5.3. Mô hình deploy từng Ban Ngành là legacy

Tài liệu cũ mô tả:

```text
Tạo Ban
→ mở QuanLyBanNganh
→ dán spreadsheetId
→ deploy Web App
→ lưu webAppUrl riêng
```

Đây là mô hình cần loại bỏ dần.

### Mô hình mới

```text
Tạo Ban
→ tạo Sheet
→ đăng ký Master Registry
→ dùng chung QuanLyBanNganh deployment
→ mở app với ministryId
```

Ví dụ:

```text
GitHub Pages:
#/church/{churchId}/ministry/{ministryId}

GAS:
...?churchId={churchId}&ministryId={ministryId}
```

Backend resolve `spreadsheetId`.

---

# 6. CẤU TRÚC REPOSITORY MỤC TIÊU

Không bắt buộc rename toàn bộ ngay trong Phase đầu.

Mục tiêu dài hạn:

```text
GGSheet-QLHT/
│
├── QuanLyHoiThanh/
│   ├── src/
│   │   ├── Code.gs
│   │   ├── Api.gs
│   │   ├── Registry.gs
│   │   ├── Security.gs
│   │   ├── Reporting.gs
│   │   ├── Database.gs
│   │   └── ...
│   ├── appsscript.json
│   ├── .clasp.json
│   └── project.config.json
│
├── QuanLyBanNganh/
│   ├── src/
│   │   ├── Code.gs
│   │   ├── Api.gs
│   │   ├── TenantResolver.gs
│   │   ├── Security.gs
│   │   ├── Members.gs
│   │   ├── Attendance.gs
│   │   ├── Finance.gs
│   │   ├── Visitations.gs
│   │   ├── Schedule.gs
│   │   ├── Database.gs
│   │   └── ...
│   ├── appsscript.json
│   ├── .clasp.json
│   └── project.config.json
│
├── shared/
│   ├── api/
│   ├── constants/
│   ├── schemas/
│   ├── validation/
│   └── frontend/
│
├── web/
│   ├── index.html
│   ├── assets/
│   ├── js/
│   └── css/
│
├── configs/
│   ├── system.config.json
│   ├── projects.registry.json
│   └── schema/
│
├── scripts/
│   ├── deploy.js
│   ├── deploy_all.js
│   ├── validate_config.js
│   ├── test.js
│   ├── scaffold_module.js
│   └── build_shared.js
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── PERMISSIONS.md
│   ├── DEPLOYMENT.md
│   ├── TESTING.md
│   ├── MIGRATION.md
│   ├── OPERATIONS.md
│   └── CHANGELOG.md
│
├── update_all.bat
├── update_hoi_thanh.bat
├── update_ban_nganh.bat
├── package.json
└── README.md
```

## 6.1. Nguyên tắc migration repository

Phase đầu:

- không mass rename nếu chưa cần;
- không di chuyển file chỉ để “đẹp”;
- ưu tiên sửa kiến trúc runtime và hiệu năng trước;
- sau khi test ổn mới refactor folder;
- mỗi refactor phải tách commit khỏi thay đổi business logic.

---

# 7. QUẢN LÝ CẤU HÌNH

## 7.1. Mục tiêu

Một giá trị không được hard-code ở nhiều nơi.

Ví dụ deployment ID không được nằm đồng thời trong:

```text
Code.gs
index.html
update_all.bat
README
...
```

## 7.2. `project.config.json`

Mỗi software module có một file.

### QuanLyHoiThanh

```json
{
  "projectKey": "QuanLyHoiThanh",
  "name": "Quản Lý Hội Thánh",
  "scriptId": "149nnAqnjMjiu8v3XU9KUZzft72mjJyR0rjJWg8HaOdem9QDDYmOyWDc0",
  "deploymentId": "AKfycbz7e9ZVchhCfuTs10-ldapfDMl3ZzqlB2jQz7nCsyFpQXzHJk6c2AYvM_qOs9MODZZ8",
  "spreadsheetId": "124O4hYFaxmZm1hg8FyRP4fci6hw84ziIg8o3eAUwMV0",
  "driveFolderId": "1dy78gH_lwfvPUKaZMRCsiOwN2ZPWcBGj"
}
```

### QuanLyBanNganh

```json
{
  "projectKey": "QuanLyBanNganh",
  "name": "Quản Lý Ban Ngành",
  "scriptId": "1tj_RVNqCmRSOz6SL8ygDdLBAUWRfjksiIvHzQmlCVIeIY2uUfHgWjzZq",
  "deploymentId": "AKfycbyTzZ_cRWo7DUaIb65Y7ihwRYuu7KY5OMvaFfZqQRTvYt1Mjv8LZebFzPbqEkF3jglI",
  "legacyDefaultSpreadsheetId": "1qI_qFmXjbnnw21qPdxeWSUpBH9itFp6TznpAKMZZwME"
}
```

## 7.3. Script Properties

Runtime config nên được đồng bộ vào:

```text
PropertiesService.getScriptProperties()
```

Ví dụ:

```text
MASTER_SPREADSHEET_ID
ROOT_DRIVE_FOLDER_ID
MINISTRY_DEPLOYMENT_ID
MINISTRY_WEBAPP_URL
DATABASE_SCHEMA_VERSION
ENVIRONMENT
```

### Không lưu trong Git

- session token;
- OTP;
- secret;
- private key;
- mật khẩu;
- thông tin nhạy cảm.

---

# 8. MASTER DATABASE — DATA MODEL

Master là registry duy nhất của toàn hệ thống.

## 8.1. `HoiThanh`

Đề xuất các cột:

```text
id
code
name
pastor
address
province
phone
email
folderId
status
createdAt
createdBy
updatedAt
updatedBy
```

### Quy tắc

- `id` là immutable.
- Không dùng `name` làm khóa.
- `code` có thể là mã dễ đọc.
- `folderId` lưu ngay khi tạo folder.
- Không tìm folder theo tên trong luồng bình thường.

---

## 8.2. `BanNganh`

```text
id
churchId
code
type
name
leaderName
secretaryName
phone
spreadsheetId
spreadsheetUrl
schemaVersion
status
provisionStatus
lastStatsAt
createdAt
createdBy
updatedAt
updatedBy
```

Có thể giữ `webAppUrl` legacy trong giai đoạn chuyển đổi nhưng không dùng làm source-of-truth.

### Quan hệ

```text
BanNganh.churchId → HoiThanh.id
```

---

## 8.3. `Users`

```text
id
email
displayName
phone
status
lastLoginAt
createdAt
updatedAt
```

---

## 8.4. `Roles`

Ví dụ:

```text
SYSTEM_ADMIN
CHURCH_ADMIN
MINISTRY_LEADER
SECRETARY
TREASURER
GROUP_LEADER
VIEWER
```

---

## 8.5. `Permissions`

Ví dụ:

```text
church.read
church.write
ministry.read
ministry.write
member.read
member.write
attendance.read
attendance.write
finance.read
finance.write
report.read
user.manage
permission.manage
settings.manage
```

---

## 8.6. `RolePermissions`

```text
roleId
permissionKey
```

---

## 8.7. `UserScopes`

```text
id
userId
roleId
scopeType
scopeId
status
```

`scopeType`:

```text
SYSTEM
CHURCH
MINISTRY
GROUP
```

Ví dụ:

```text
User A
role = CHURCH_ADMIN
scopeType = CHURCH
scopeId = HT001
```

→ chỉ quản lý HT001 và các Ban thuộc HT001.

---

## 8.8. `BanNganhStats`

Snapshot phục vụ dashboard.

```text
ministryId
churchId
totalMembers
activeMembers
attendanceRate4Weeks
attendanceRate12Weeks
absentWarnings
activeCareCases
monthIncome
monthExpense
balance
upcomingBirthdays
lastUpdatedAt
```

### Nguyên tắc

Dashboard không được mở tất cả Spreadsheet con.

---

## 8.9. `AuditLog`

```text
id
timestamp
userId
action
module
churchId
ministryId
recordId
beforeData
afterData
requestId
sessionId
```

Audit bắt buộc cho:

- Finance;
- Users;
- Permission;
- Member delete;
- Bulk import;
- Settings;
- backup/restore;
- provisioning.

---

## 8.10. `SystemConfig`

```text
key
value
updatedAt
updatedBy
```

---

## 8.11. `BackupLog`

```text
id
targetType
targetId
sourceFileId
backupFileId
backupAt
status
message
```

---

# 9. BAN NGÀNH DATABASE — CORE SCHEMA

Core schema chuẩn:

```text
ThanhVien
ToNhom
DiemDanh
ThamVieng
LichQuy
ChuDe
SoQuy
DanhMucQuy
MauTinNhan
CauHinh
```

## 9.1. `CauHinh`

Bắt buộc có:

```text
churchId
ministryId
schemaVersion
dataVersion
ministryName
churchName
```

## 9.2. Nguyên tắc ID

Mọi entity phải có unique ID.

Không sử dụng:

- tên người;
- số dòng;
- số thứ tự hiển thị;

làm khóa nghiệp vụ.

Khuyến nghị:

```javascript
Utilities.getUuid()
```

## 9.3. Data integrity tối thiểu

Mọi bảng quan trọng cần có khi migration phù hợp:

```text
createdAt
createdBy
updatedAt
updatedBy
status
```

Dữ liệu quan trọng nên dùng soft delete.

---

# 10. GOOGLE DRIVE ARCHITECTURE

Cấu trúc mục tiêu:

```text
QLHT_DATABASE/
│
├── QLHT_MASTER
│
├── _SYSTEM/
│   ├── Templates/
│   │   └── TEMPLATE_BAN_NGANH
│   └── Backups/
│
├── HT_NTP_NguyenTriPhuong/
│   ├── Ministries/
│   │   ├── DB_BTT_NTP
│   │   ├── DB_BTN_NTP
│   │   └── DB_BTNHI_NTP
│   ├── Documents/
│   └── Reports/
│
├── HT_VP_VinhPhuoc/
│   ├── Ministries/
│   ├── Documents/
│   └── Reports/
│
└── ...
```

## 10.1. Tạo Hội Thánh

Luồng:

```text
apiCreateChurch()
   ↓
validate
   ↓
create ID
   ↓
create Drive folder
   ↓
save folderId vào HoiThanh
   ↓
return Church object
```

### Idempotency

Nếu retry:

- không tạo folder trùng;
- ưu tiên lookup bằng `folderId`;
- lookup theo tên chỉ là recovery fallback.

---

# 11. PROVISION BAN NGÀNH

## 11.1. Luồng chuẩn

```text
Create Ministry
    ↓
register metadata
    ↓
status = PROVISIONING
    ↓
create/copy Sheet
    ↓
initialize schema
    ↓
write churchId + ministryId
    ↓
move vào folder Hội Thánh
    ↓
save spreadsheetId + URL
    ↓
status = ACTIVE
```

## 11.2. Khuyến nghị dùng Template

Thay vì tạo và format 10 tab từ đầu mỗi lần:

```text
_SYSTEM/Templates/TEMPLATE_BAN_NGANH
```

rồi:

```text
makeCopy()
→ đổi tên
→ điền CauHinh
→ register
```

Ưu điểm:

- nhanh hơn;
- format nhất quán;
- validation nhất quán;
- ít Spreadsheet calls;
- dễ versioning.

`setupDatabase()` vẫn được giữ làm fallback/migration.

## 11.3. Rollback provisioning

Nếu tạo file thành công nhưng register thất bại:

- ghi `provisionStatus = ERROR`;
- log lỗi;
- không tạo file mới khi retry nếu có thể recover;
- nếu chắc chắn file orphan do lần thực thi đó tạo thì chuyển Trash hoặc đánh dấu để admin xử lý.

Không nuốt exception.

---

# 12. SHARED MINISTRY ENGINE

## 12.1. Request context

Client chỉ gửi:

```json
{
  "churchId": "HT...",
  "ministryId": "BN..."
}
```

Không gửi `spreadsheetId` như quyền truy cập.

## 12.2. Tenant Resolver

Pseudo flow:

```text
resolveTenant(context, session)
    ↓
validate session
    ↓
validate permission
    ↓
validate scope
    ↓
read BanNganh Registry
    ↓
verify churchId matches
    ↓
verify status ACTIVE
    ↓
return spreadsheetId
```

## 12.3. Cache resolver

Registry lookup ít thay đổi, có thể cache:

```text
tenant:{ministryId}
```

nhưng luôn có fallback Master Sheet.

Khi Ban Ngành đổi config:

```text
invalidate cache
```

---

# 13. DUAL-MODE FRONTEND

## 13.1. Mode A — Apps Script Web App

Sử dụng:

```javascript
google.script.run
```

## 13.2. Mode B — GitHub Pages

Sử dụng HTTP transport tới GAS Web App.

## 13.3. Một API Client chung

Frontend nên có interface:

```javascript
api.call(action, context, payload)
```

Transport tự chọn:

```text
GasTransport
HttpTransport
```

Business layer không cần biết frontend đang chạy ở đâu.

## 13.4. Route

GitHub Pages nên ưu tiên hash route để tránh lỗi route static:

```text
#/church/{churchId}/ministry/{ministryId}
```

Không nhúng `spreadsheetId` vào URL.

---

# 14. API CONTRACT

## 14.1. Request

```json
{
  "action": "members.list",
  "context": {
    "churchId": "HT001",
    "ministryId": "BN001"
  },
  "payload": {},
  "sessionToken": "..."
}
```

## 14.2. Response success

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "...",
    "version": 125,
    "serverTime": "2026-08-21T04:00:00.000Z"
  },
  "error": null
}
```

## 14.3. Response error

```json
{
  "success": false,
  "data": null,
  "meta": {
    "requestId": "...",
    "serverTime": "2026-08-21T04:00:00.000Z"
  },
  "error": {
    "code": "FORBIDDEN",
    "message": "Bạn không có quyền thực hiện thao tác này."
  }
}
```

### Không trả client

- stack trace production;
- file ID không cần thiết;
- nội dung cache;
- secret;
- raw exception nhạy cảm.

---

# 15. AUTHENTICATION / SESSION / PERMISSION

Đây là Phase bắt buộc trước khi coi hệ thống là production-ready trên GitHub Pages.

## 15.1. Security pipeline

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
    ↓
Tenant Resolver
    ↓
Business Action
```

## 15.2. Scope

### System Admin

```text
Toàn hệ thống
```

### Church Admin

```text
Một Hội Thánh
+ tất cả Ban thuộc Hội Thánh đó
```

### Ministry Leader

```text
Một Ban Ngành
```

### Secretary

```text
Member
Attendance
Schedule
Reports được cấp
```

### Treasurer

```text
Finance
```

### Group Leader

```text
Tổ mình
Thành viên tổ mình
Điểm danh tổ mình
Thăm viếng tổ mình
```

## 15.3. Khuyến nghị authentication serverless

Nếu không thể dựa chắc chắn vào Google Workspace identity cho toàn bộ người dùng:

### Khuyến nghị

```text
Email
→ OTP
→ verify
→ random session token
→ CacheService / session store
```

Yêu cầu:

- OTP hết hạn;
- rate limit;
- không log OTP;
- session token entropy cao;
- session expiry;
- revoke;
- audit login;
- không lưu password dạng plain text.

Nếu source hiện tại đã có auth khác, Antigravity phải audit trước khi thay.

---

# 16. PERFORMANCE — P0

Đây là các thay đổi bắt buộc.

## P0.1. Không full refresh sau CRUD

Không:

```text
save
→ refreshData()
→ apiGetInitialData()
→ đọc tất cả tab
→ render tất cả
```

Phải:

```text
save
→ API trả record
→ update local state
→ render module liên quan
```

---

## P0.2. Không `setupDatabase()` trong luồng tải bình thường

Dùng:

```text
schemaVersion
```

Chỉ migration khi:

- database mới;
- schema version thay đổi;
- admin yêu cầu;
- thiếu Sheet bắt buộc.

---

## P0.3. `sheetUpdate()` một lần ghi

Luồng:

```text
read headers
→ locate ID column
→ read ID column
→ find target row
→ read one row
→ mutate in memory
→ setValues() một lần
```

Không:

```javascript
setValue()
```

trong loop cập nhật nhiều cột.

---

## P0.4. Batch Assign Group

Không ghi từng thành viên.

Phải:

```text
read ID column
read group column
update array
setValues()
```

---

## P0.5. Bulk Import

Không:

```text
500 rows
→ 500 sheetInsert()
```

Phải:

```text
read once
→ Map
→ validate all
→ batch insert
→ batch update
→ result report
```

Report:

```text
added
updated
skipped
errors
```

---

## P0.6. Lock

Không:

```javascript
try {
  lock.waitLock(...);
} catch (e) {}
```

Phải:

```javascript
const lock = LockService.getScriptLock();

if (!lock.tryLock(1500)) {
  throw new Error('SYSTEM_BUSY');
}

try {
  // write only
} finally {
  lock.releaseLock();
}
```

### Nguyên tắc

- chuẩn bị data trước lock;
- lock chỉ phần ghi;
- batch operation chỉ lock một lần;
- không setup schema trong lock;
- không nuốt timeout.

---

# 17. PERFORMANCE — P1

## 17.1. Lazy Load

Khởi động:

```text
apiGetBootstrapData()
```

không tải toàn bộ lịch sử.

## 17.2. Members

```javascript
apiGetMembers({
  page,
  pageSize,
  keyword,
  groupId,
  status
})
```

## 17.3. Attendance

```javascript
apiGetAttendanceByDate(date)
apiGetAttendanceRange(fromDate, toDate)
apiGetAttendanceSummary()
```

Không tải tất cả lịch sử.

## 17.4. Finance

Có phân trang và filter thời gian.

## 17.5. Visitations

Có phân trang.

## 17.6. Frontend render

Không:

```javascript
renderAll();
```

sau mọi thay đổi.

Dùng:

```javascript
renderCurrentView();
```

và dirty flags.

## 17.7. Attendance interaction

Bấm một checkbox:

```text
update one row
+ update summary
```

không rebuild toàn bộ danh sách.

## 17.8. Map / Set

Thay `.find()` lặp lại trong vòng lặp bằng `Map`/`Set`.

## 17.9. Cache

Cache phù hợp:

- registry;
- role/permission;
- group list;
- KPI snapshot;
- cấu hình ít thay đổi.

Cache không phải source-of-truth.

---

# 18. DATA VERSION

Mỗi module dữ liệu có thể có version.

Ví dụ:

```text
membersVersion
groupsVersion
attendanceVersion
financeVersion
settingsVersion
```

Luồng:

```text
clientVersion == serverVersion
→ không tải lại

clientVersion != serverVersion
→ tải module thay đổi
```

---

# 19. FRONTEND STATE

State là nguồn dữ liệu chính của UI.

Ví dụ:

```javascript
state = {
  context: {
    churchId: null,
    ministryId: null
  },
  user: null,
  permissions: [],
  members: [],
  groups: [],
  versions: {},
  dirty: {}
};
```

CRUD:

```text
API success
→ upsertById()
→ mark dirty dashboard
→ render current view
```

Không full reload.

---

# 20. MEMBER 360°

Hồ sơ Ban viên mục tiêu:

```text
Ban viên
│
├── Thông tin cá nhân
├── Avatar
├── QR
├── Tổ hiện tại
├── Chức vụ
├── Ngày gia nhập
├── Lịch sử tổ
├── Lịch sử chức vụ
├── Điểm danh
├── Tỷ lệ chuyên cần
├── Thuộc câu gốc
├── Thăm viếng
├── Người chăm sóc
├── Nhu cầu cầu nguyện
├── Sinh nhật
├── Ghi chú chăm sóc
└── Timeline
```

Không triển khai tất cả trong Phase kiến trúc ban đầu.

---

# 21. CARE WORKFLOW

Luồng:

```text
Vắng / cần quan tâm
   ↓
Create Care Case
   ↓
Assign
   ↓
Deadline
   ↓
Contact / Visit
   ↓
Result
   ↓
Follow-up
   ↓
Close
```

Schema mục tiêu:

```text
id
churchId
ministryId
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
createdAt
updatedAt
```

Status:

```text
NEW
IN_PROGRESS
FOLLOW_UP
RESOLVED
CLOSED
```

---

# 22. ATTENDANCE NÂNG CẤP

Status:

```text
PRESENT
EXCUSED_ABSENCE
UNEXCUSED_ABSENCE
LATE
```

Fields:

```text
reason
arrivalTime
note
```

Business key chống trùng:

```text
date + memberId
```

Không append trùng dữ liệu cùng ngày.

---

# 23. DASHBOARD

## 23.1. Ministry Dashboard

- tổng Ban viên;
- tăng/giảm;
- attendance;
- vắng nhiều;
- Care Case;
- sinh nhật;
- thu/chi;
- số dư;
- hoạt động sắp tới.

## 23.2. Church Dashboard

Gộp snapshot của tất cả Ban thuộc một Hội Thánh.

## 23.3. System Dashboard

Chỉ user có SYSTEM scope.

Gộp nhiều Hội Thánh.

---

# 24. REPORT CENTER

## Member

- theo tổ;
- độ tuổi;
- giới tính;
- trạng thái;
- mới;
- chưa có tổ.

## Attendance

- tuần;
- tháng;
- quý;
- tổ;
- cá nhân;
- vắng liên tục.

## Care

- số Case;
- quá hạn;
- theo tổ;
- theo người phụ trách.

## Finance

- thu;
- chi;
- quỹ;
- hạng mục;
- tháng;
- quý;
- năm.

## Output

- Excel;
- PDF;
- Print.

Không quét toàn hệ thống khi chỉ cần một Hội Thánh.

---

# 25. CRM THÂN HỮU / TÂN TÍN HỮU

Phase mở rộng.

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

Không trộn dữ liệu thân hữu vào `ThanhVien` nếu lifecycle chưa đạt Ban viên.

---

# 26. LỊCH / PHÂN CÔNG / HOẠT ĐỘNG

Lịch chương trình có thể quản lý:

```text
Hướng dẫn
Diễn giả
Cầu nguyện
Piano
Organ
Guitar
Trống
Âm thanh
Trình chiếu
Tiếp tân
...
```

Assignment status:

```text
PENDING
CONFIRMED
REPLACEMENT_NEEDED
```

Module `HoatDong` phục vụ:

- thông công;
- dã ngoại;
- trại;
- Giáng Sinh;
- truyền giảng;
- chuyên đề;
- hoạt động đặc biệt.

---

# 27. NOTIFICATION CENTER

Ví dụ:

```text
🔴 Vắng ≥ 3 tuần
🟠 Case quá hạn
🎂 Sinh nhật
📅 Lịch phụ trách
💰 Giao dịch thiếu chứng từ
👤 Thành viên chưa có tổ
```

Level:

```text
INFO
WARNING
CRITICAL
```

---

# 28. TÀI CHÍNH

Phạm vi:

- thu;
- chi;
- quỹ;
- hạng mục;
- chứng từ;
- người thực hiện;
- báo cáo;
- audit.

Không biến GGSheet-QLHT thành phần mềm kế toán đầy đủ.

Finance phải có permission riêng.

---

# 29. PWA / MOBILE / QR

Phase trải nghiệm.

Yêu cầu:

- responsive;
- Add to Home Screen;
- camera QR;
- nút điểm danh lớn;
- thao tác thăm viếng nhanh;
- loading skeleton;
- offline app shell;
- cache static assets.

QR chỉ chứa ID/token tra cứu, không chứa dữ liệu cá nhân nhạy cảm.

---

# 30. MASTER SNAPSHOT STRATEGY

## Không làm

```text
Dashboard
→ openSpreadsheet A
→ openSpreadsheet B
→ openSpreadsheet C
→ ...
```

## Làm

```text
Ministry data
   ↓
scheduled / controlled aggregation
   ↓
BanNganhStats
   ↓
Master Dashboard
```

`lastUpdatedAt` phải hiển thị để người dùng biết độ mới.

Có thể hỗ trợ nút:

```text
Làm mới số liệu
```

cho admin.

---

# 31. BACKUP & RESTORE

Cấu trúc:

```text
_SYSTEM/Backups/
├── Daily/
├── Weekly/
└── Monthly/
```

Retention mục tiêu:

```text
7 daily
4 weekly
12 monthly
```

Backup:

- Master;
- từng Ministry database;
- log trạng thái.

Nếu số lượng file tăng lớn, không backup tất cả trong một execution dài.

Dùng cursor/batch theo trigger.

Restore phải có test định kỳ.

---

# 32. DEPLOYMENT / AUTOMATION

## 32.1. `update_all.bat`

Không chứa hard-coded deployment ID.

Chỉ nên gọi:

```text
node scripts/deploy_all.js
```

## 32.2. `update_hoi_thanh.bat`

```text
node scripts/deploy.js QuanLyHoiThanh
```

## 32.3. `update_ban_nganh.bat`

```text
node scripts/deploy.js QuanLyBanNganh
```

## 32.4. `deploy.js`

Nhiệm vụ:

```text
read project.config.json
validate
build shared code
clasp push
create/update version
deploy đúng deployment
smoke test
return result
```

Sau deploy thành công mới cho phép Git push nếu workflow được cấu hình như vậy.

### Không làm

```text
clasp push thất bại
nhưng vẫn git push và báo thành công
```

---

# 33. AUTO WATCH

`auto_watch_and_sync.bat` chỉ nên dùng development.

Không nên auto-deploy production mỗi lần Ctrl+S nếu hệ thống đã có người dùng thật.

Khuyến nghị:

```text
DEV
→ auto sync

PRODUCTION
→ explicit deploy
→ smoke test
→ release
```

---

# 34. SCAFFOLD — PHÂN BIỆT MODULE VÀ BAN NGÀNH

## Sai

```text
create_new_ban.bat BanThanhNien
→ copy toàn bộ source QuanLyBanNganh
```

## Đúng

Tạo Ban Ngành bằng Master UI/API:

```text
apiCreateMinistry()
→ provision Sheet
```

## `scaffold_module.js`

Chỉ dùng khi tạo **software module mới**, ví dụ:

```text
QuanLyTaiSan
QuanLyLopHoc
```

Nó có thể tạo:

```text
module folder
project.config.json
.clasp.json template
appsscript.json
src/
tests/
docs/
```

---

# 35. GOOGLE SHEETS BEST PRACTICES BẮT BUỘC

1. Batch read.
2. Batch write.
3. `getValues()` theo range.
4. `setValues()` theo range.
5. Không `setValue()` trong loop lớn.
6. Không `getRange()` lặp lại nếu có thể đọc một khối.
7. Không `getDataRange()` vô điều kiện cho thao tác nhỏ.
8. Dùng `Map`.
9. Dùng `Set`.
10. Validate trước write.
11. Lock chỉ write.
12. API trả record vừa thay đổi.
13. Không reload toàn DB sau CRUD.
14. Không đọc lịch sử nếu UI không cần.
15. Không gọi schema setup trong request bình thường.

---

# 36. LOGGING / OBSERVABILITY

Mỗi request nên có:

```text
requestId
userId
action
churchId
ministryId
durationMs
status
```

Performance log:

```text
[PERF] members.list 420ms
[PERF] members.save 260ms
[PERF] attendance.getByDate 310ms
[PERF] bulkImport 2100ms
```

Không log:

- OTP;
- session token;
- dữ liệu nhạy cảm nguyên văn.

---

# 37. TESTING

## 37.1. Unit / Node mock

Kiểm tra:

- normalize;
- map;
- validation;
- permission;
- scope;
- payload;
- ID;
- state update.

## 37.2. Integration

- Apps Script API;
- Google Sheet test;
- provisioning;
- tenant resolver;
- migration.

## 37.3. Multi-tenant isolation — BẮT BUỘC

Test:

```text
User HT001
→ không đọc HT002

User Ministry BN001
→ không đọc BN002

Group Leader T01
→ không đọc T02 nếu không được cấp
```

## 37.4. Performance

Baseline:

```text
100 members
500 members
1,000 members
10,000 attendance
50,000 attendance
```

Đo:

- API duration;
- Spreadsheet calls;
- payload;
- render time;
- lock timeout;
- full refresh count.

## 37.5. Regression

Không mất:

- CRUD;
- attendance;
- finance;
- schedule;
- visitation;
- settings;
- Master provisioning;
- GitHub Pages;
- GAS direct mode.

---

# 38. PERFORMANCE ACCEPTANCE CRITERIA

Không chỉ dựa vào thời gian tuyệt đối vì Apps Script có latency dao động.

Bắt buộc đạt:

### CRUD

```text
1 action
→ 1 business API request
→ không apiGetInitialData()
→ không full workbook read
→ không setValue loop
```

### Batch Assign

```text
N members
→ batch read
→ batch write
```

Số Spreadsheet writes không tỷ lệ tuyến tính theo N.

### Bulk Import

```text
500 rows
→ không 500 CRUD server writes
```

### Bootstrap

Không trả:

- full attendance history;
- full finance history;
- full visitation history.

### UI

Không render tất cả view sau một thay đổi nhỏ.

---

# 39. SECURITY ACCEPTANCE CRITERIA

1. Không API nào tin `spreadsheetId` từ client.
2. Mọi mutation kiểm tra session.
3. Mọi mutation kiểm tra permission.
4. Mọi mutation kiểm tra scope.
5. Finance có permission riêng.
6. User/Permission có audit.
7. Không secret trong repo.
8. Session hết hạn.
9. Có revoke session.
10. Cross-tenant test phải pass.

---

# 40. DATA INTEGRITY ACCEPTANCE CRITERIA

- unique ID;
- không duplicate attendance;
- validate phone;
- validate date;
- validate amount;
- soft delete dữ liệu quan trọng;
- created/updated metadata;
- schema version;
- migration idempotent;
- không dùng tên làm primary key.

---

# 41. ROADMAP TRIỂN KHAI CHUẨN

## PHASE 0 — Discovery, Backup, Baseline

**Không sửa production logic trước khi hoàn thành.**

Công việc:

1. Audit toàn repo.
2. Xác định chính xác:
   - scriptId;
   - deploymentId;
   - spreadsheetId;
   - folderId;
   - hard-coded IDs.
3. Liệt kê Sheet/tab/header thực tế.
4. Backup Master.
5. Backup Ban mẫu.
6. Chạy baseline performance.
7. Ghi:
   - `docs/CURRENT_STATE.md`;
   - `docs/CONFIG_AUDIT.md`;
   - `docs/PERFORMANCE_BASELINE.md`.

**Definition of Done**

- biết rõ current state;
- backup restore được;
- không còn nghi ngờ ID nào đang production.

---

## PHASE 1 — Config & Deploy Foundation

Công việc:

1. Chuẩn hóa `project.config.json`.
2. Loại hard-code duplicate.
3. Chuẩn hóa `.clasp.json`.
4. Viết `validate_config.js`.
5. Viết `deploy.js`.
6. Sửa `.bat` thành wrapper.
7. Giữ nguyên UI/business behavior.

**Definition of Done**

- đổi deployment ID chỉ sửa một nguồn;
- validate phát hiện config sai;
- deploy hai Apps Script độc lập được.

---

## PHASE 2 — Tenant Registry & Security Boundary

Công việc:

1. Chuẩn hóa `HoiThanh`.
2. Chuẩn hóa `BanNganh.churchId`.
3. Tạo `TenantResolver`.
4. API dùng `churchId + ministryId`.
5. Không tin `sheetId` client.
6. Cơ chế permission/scope baseline.
7. Compatibility layer cho URL cũ.

**Definition of Done**

- một deployment Ban Engine mở được nhiều Ban;
- Ban HT001 và HT002 tách biệt;
- cross-tenant test pass.

---

## PHASE 3 — Performance P0

Ưu tiên đúng thứ tự:

1. `sheetUpdate()`.
2. `apiBatchAssignGroup()`.
3. `apiBulkImportMembers()`.
4. schema version.
5. bỏ setupDatabase khỏi load.
6. lock.
7. bỏ full refresh sau CRUD.

**Definition of Done**

- tiêu chí Section 38 pass;
- behavior cũ không mất.

---

## PHASE 4 — Modular API + Frontend State

Công việc:

1. `apiGetBootstrapData`.
2. members lazy load.
3. attendance by date/range.
4. finance pagination.
5. visitation pagination.
6. render current view.
7. dirty flags.
8. module version/cache.

---

## PHASE 5 — Master Snapshot / Reporting

Công việc:

1. `BanNganhStats`.
2. Ministry stats job.
3. Church dashboard.
4. System dashboard.
5. Report Center cơ bản.

---

## PHASE 6 — Member 360 + Care + Attendance nâng cao

Công việc:

1. Member 360.
2. Care Case.
3. attendance status.
4. absence alerts.
5. member timeline.

---

## PHASE 7 — CRM / Events / Notifications

- Thân hữu;
- Tân tín hữu;
- Hoạt động;
- lịch phân công;
- message templates;
- notifications.

---

## PHASE 8 — PWA / QR / UX

- PWA;
- QR;
- mobile-first;
- offline shell;
- camera.

---

## PHASE 9 — Hardening

- backup automation;
- restore test;
- security test;
- performance test;
- docs;
- changelog;
- cleanup legacy.

---

# 42. THỨ TỰ ƯU TIÊN THỰC TẾ

Nếu cần tập trung ít việc nhất nhưng hiệu quả cao nhất:

```text
1. Config audit + backup
2. Tenant Resolver + không tin sheetId
3. Authentication / Permission / Scope
4. sheetUpdate batch
5. bỏ full refresh
6. bulk import
7. modular API
8. BanNganhStats
9. Member 360
10. Care Workflow
```

---

# 43. MIGRATION KHÔNG PHÁ HỆ THỐNG CŨ

Antigravity phải áp dụng strangler migration.

## Bước A

Giữ API cũ hoạt động.

## Bước B

Thêm API mới song song.

## Bước C

Frontend mới dùng API mới.

## Bước D

Log API cũ còn được gọi hay không.

## Bước E

Chỉ xóa legacy sau khi:

- không còn call;
- regression pass;
- backup có;
- rollback có.

---

# 44. COMPATIBILITY

Trong thời gian chuyển đổi có thể hỗ trợ:

```text
?sheetId=legacy
```

nhưng server chỉ dùng nó để ánh xạ sang `ministryId` đã biết.

Không mở arbitrary Spreadsheet.

Sau migration:

```text
sheetId client parameter
```

phải bị loại bỏ.

---

# 45. CÁC ANTI-PATTERN BỊ CẤM

Antigravity không được:

1. Copy `QuanLyBanNganh` cho mỗi Ban.
2. Tạo GAS project mới cho mỗi Hội Thánh chỉ vì thêm tenant.
3. Hard-code Spreadsheet ID trong frontend.
4. Tin Spreadsheet ID do client gửi.
5. Full refresh sau CRUD.
6. `setValue()` trong loop lớn.
7. `getRange()` hàng trăm lần trong loop.
8. `setupDatabase()` mỗi request.
9. Nuốt exception.
10. Nuốt lock timeout.
11. Render all views.
12. Quét tất cả Ministry DB để mở Master Dashboard.
13. Đổi tên header production không migration.
14. Xóa chức năng cũ trong cùng commit với refactor lớn.
15. Auto deploy production mỗi Ctrl+S khi có user thật.
16. Lưu secret/token trong Git.
17. Dùng tên Hội Thánh/Ban viên làm ID.
18. Sửa tất cả phase cùng một lúc.

---

# 46. CODE QUALITY

Backend:

- Apps Script V8;
- JSDoc public functions;
- helper private kết thúc `_`;
- constants tập trung;
- validation tập trung;
- response chuẩn;
- no silent catch;
- try/finally lock;
- requestId;
- error code.

Frontend:

- API client;
- state;
- selectors;
- render module;
- event delegation khi phù hợp;
- loading state theo module;
- error state theo module.

---

# 47. ERROR CODE GỢI Ý

```text
AUTH_REQUIRED
SESSION_EXPIRED
FORBIDDEN
TENANT_NOT_FOUND
TENANT_INACTIVE
CHURCH_NOT_FOUND
MINISTRY_NOT_FOUND
MEMBER_NOT_FOUND
DUPLICATE_MEMBER
DUPLICATE_ATTENDANCE
VALIDATION_ERROR
SYSTEM_BUSY
SCHEMA_MISMATCH
PROVISION_FAILED
BACKUP_FAILED
INTERNAL_ERROR
```

---

# 48. DOCUMENTATION PHẢI SINH RA

Sau quá trình nâng cấp repo phải có:

```text
docs/
├── CURRENT_STATE.md
├── CONFIG_AUDIT.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── SECURITY.md
├── PERMISSIONS.md
├── DEPLOYMENT.md
├── MIGRATION.md
├── TESTING.md
├── PERFORMANCE_BASELINE.md
├── PERFORMANCE_RESULTS.md
├── OPERATIONS.md
└── CHANGELOG.md
```

---

# 49. CÁCH ANTIGRAVITY PHẢI LÀM VIỆC

Mỗi phase:

## 49.1. Trước khi code

Trả:

```text
A. Current state
B. Files liên quan
C. Risks
D. Plan
E. Tests dự kiến
```

## 49.2. Khi code

- thay đổi nhỏ;
- commit logic rõ;
- không sửa file không liên quan;
- giữ backward compatibility;
- thêm log;
- thêm test.

## 49.3. Sau khi code

Trả:

```text
1. Files changed
2. Changes
3. Why
4. Test result
5. Performance before/after
6. Security impact
7. Rollback
8. Remaining risks
```

## 49.4. Không tự chuyển phase

Chỉ chuyển phase khi phase hiện tại:

```text
implemented
+ tested
+ accepted
```

---

# 50. PHASE ĐẦU TIÊN ANTIGRAVITY PHẢI THỰC HIỆN

Không bắt đầu bằng viết lại toàn bộ hệ thống.

Bắt đầu:

## Task 1 — Repository Audit

Tìm:

```text
scriptId
spreadsheetId
deploymentId
driveFolderId
webAppUrl
setupDatabase
apiGetInitialData
refreshData
sheetUpdate
apiBatchAssignGroup
apiBulkImportMembers
LockService
setValue(
getDataRange(
renderAll
```

## Task 2 — Config Matrix

Tạo bảng:

| Value | File hiện tại | Giá trị | Target | Action |
|---|---|---|---|---|

## Task 3 — Database Matrix

Liệt kê:

```text
Sheet
headers
row count
read/write functions
dependencies
```

## Task 4 — Performance Baseline

Đo:

- app bootstrap;
- save member;
- delete member;
- batch assign;
- bulk import;
- attendance load;
- finance load.

## Task 5 — Backups

Backup trước khi migration.

---

# 51. SPRINT KỸ THUẬT ĐẦU TIÊN SAU AUDIT

Sau khi Phase 0 được duyệt:

## 51.1. `sheetUpdate()`

- chỉ đọc ID column;
- đọc target row;
- một `setValues()`;
- return saved record.

## 51.2. `apiBatchAssignGroup()`

- `Set`;
- batch read;
- batch write.

## 51.3. `apiBulkImportMembers()`

- `Map`;
- batch insert;
- batch update;
- report.

## 51.4. Schema Version

- không setup mỗi load.

## 51.5. Frontend CRUD

- bỏ full refresh cho Member trước;
- thử nghiệm ổn rồi mở rộng module khác.

---

# 52. MASTER REPORTING — 3 CẤP

Hệ thống phải hỗ trợ:

## Level 1 — Ban Ngành

```text
Ban Thanh Niên HT001
```

## Level 2 — Hội Thánh

```text
HT001
= tổng hợp tất cả Ban của HT001
```

## Level 3 — System

```text
HT001 + HT002 + HT003 + ...
```

Mọi report query phải luôn có scope.

---

# 53. VÍ DỤ PHÂN QUYỀN

## User A

```text
Role: CHURCH_ADMIN
Scope: HT001
```

Có thể:

```text
HT001/BTT
HT001/BTN
HT001/BTNHI
```

Không thể:

```text
HT002/*
```

## User B

```text
Role: TREASURER
Scope: BN002
```

Có thể:

```text
finance.read
finance.write
```

chỉ BN002.

## User C

```text
Role: GROUP_LEADER
Scope: TO03
```

chỉ Tổ 03.

---

# 54. CƠ CHẾ TẠO HỘI THÁNH / BAN NGÀNH CHUẨN

## Create Church

```text
Admin
→ New Church
→ validate
→ create churchId
→ create Drive folder
→ register
→ done
```

## Create Ministry

```text
Choose Church
→ New Ministry
→ create ministryId
→ register PROVISIONING
→ copy template Sheet
→ initialize
→ save Sheet ID
→ status ACTIVE
→ done
```

Không deploy code mới.

---

# 55. UX PORTAL

Home:

```text
Các Hội Thánh được phép truy cập
```

Chọn:

```text
HỘI THÁNH NGUYỄN TRI PHƯƠNG
```

Hiển thị:

```text
Dashboard Hội Thánh

Ban Thanh Tráng
Ban Thanh Niên
Ban Thiếu Nhi
...
```

Chọn Ban:

```text
QuanLyBanNganh Engine
+ context ministryId
```

---

# 56. KHI NÀO MỚI TÁCH THÊM APPS SCRIPT PROJECT

Chỉ khi module:

- business logic khác đáng kể;
- quota cần tách;
- quyền cần tách;
- deployment lifecycle khác;
- team ownership khác.

Ví dụ có thể tách:

```text
Asset Management
Class Management
Document Service
Heavy Reporting
```

Không tách chỉ vì:

```text
Ban khác tên
Hội Thánh khác tên
```

---

# 57. QUOTA / SCALABILITY

Google Sheets vẫn phù hợp giai đoạn hiện tại nếu:

- batch;
- lazy load;
- pagination;
- snapshot;
- cache;
- history range;
- archive.

Cân nhắc database khác khi:

- concurrent users cao;
- transaction phức tạp;
- audit rất lớn;
- report cross-tenant thời gian thực nặng;
- Apps Script quota thường xuyên chạm;
- Sheet vượt khả năng vận hành thực tế.

Kiến trúc `churchId` / `ministryId` phải được giữ để migration dễ.

---

# 58. DEFINITION OF DONE TOÀN HỆ THỐNG 10/10

## Architecture

- monorepo;
- module boundary rõ;
- tenant không copy code.

## Security

- auth;
- session;
- role;
- permission;
- scope;
- audit.

## Performance

- batch;
- lazy;
- no full refresh;
- modular API;
- cache/version.

## Data

- ID;
- validation;
- schema version;
- backup.

## Workflow

- Member 360;
- Attendance;
- Care;
- Finance;
- Schedule;
- Events.

## Reporting

- Ministry;
- Church;
- System.

## UX

- responsive;
- PWA;
- QR;
- clear loading/error.

## DevOps

- config source-of-truth;
- deploy scripts;
- tests;
- docs;
- rollback.

---

# 59. PROMPT THỰC THI CHÍNH DÀNH CHO ANTIGRAVITY

Sao chép phần dưới đây nếu cần đưa lại riêng cho Antigravity.

```text
Bạn đang làm việc với repository:

https://github.com/haiyenpa25/GGSheet-QLHT

Hãy coi file "GGSheet-QLHT_MASTER_SPEC_ANTIGRAVITY.md" là đặc tả kiến trúc ưu tiên cao nhất.

MỤC TIÊU HỆ THỐNG

GGSheet-QLHT là hệ thống Serverless sử dụng:

- Google Apps Script backend
- Google Sheets database
- Google Drive
- GitHub monorepo
- GitHub Pages frontend

Hệ thống quản lý nhiều Hội Thánh.

Mỗi Hội Thánh là một tenant cấp cao và có nhiều Ban Ngành riêng.

Ví dụ:

HT001
- Ban Thanh Tráng
- Ban Thanh Niên
- Ban Thiếu Nhi

HT002
- Ban Thanh Tráng
- Ban Thanh Niên

Mỗi Ban Ngành có một Google Sheet database riêng.

Tuy nhiên KHÔNG được tạo bản sao source code cho từng Ban.

QuanLyBanNganh phải là một Shared Ministry Engine dùng chung cho tất cả Ban Ngành.

Client chỉ gửi churchId + ministryId.
Backend phải resolve spreadsheetId từ Master Registry.
Tuyệt đối không tin arbitrary spreadsheetId từ client.

Master phải quản lý:

- HoiThanh
- BanNganh
- Users
- Roles
- Permissions
- UserScopes
- BanNganhStats
- AuditLog
- SystemConfig
- BackupLog

Dashboard Hội Thánh và dashboard System không được mở tất cả database Ban Ngành mỗi lần load.
Phải dùng snapshot BanNganhStats.

Hệ thống phải hỗ trợ hai chế độ:

1. Apps Script Web App trực tiếp
2. GitHub Pages

Hai chế độ phải dùng chung API contract/business logic.

NGUYÊN TẮC HIỆU NĂNG

- không full refresh sau CRUD
- không setupDatabase trong mỗi lần load
- không setValue trong loop lớn
- dùng batch getValues/setValues
- dùng Map/Set
- lazy load
- pagination
- attendance theo date/range
- cache + version
- render đúng module

NGUYÊN TẮC SECURITY

- Authentication
- Session
- Role
- Permission
- Scope
- Tenant Resolver
- Audit
- không secret trong Git
- không tin sheetId client
- Finance permission riêng

QUY TẮC TRIỂN KHAI

Không được sửa toàn bộ hệ thống trong một lần.

PHASE 0 trước tiên:

1. Audit repo.
2. Kiểm tra tất cả scriptId, spreadsheetId, deploymentId, folderId.
3. Tìm tất cả hard-coded IDs.
4. Audit database schema thực tế.
5. Backup.
6. Đo performance baseline.
7. Tạo:
   docs/CURRENT_STATE.md
   docs/CONFIG_AUDIT.md
   docs/PERFORMANCE_BASELINE.md

Không thay đổi production logic cho tới khi Phase 0 hoàn thành.

Sau mỗi phase phải trả:

1. Files changed.
2. Current issue.
3. Change implemented.
4. Tests.
5. Performance before/after.
6. Security impact.
7. Rollback.
8. Remaining risks.

Không tự chuyển phase khi chưa kiểm thử xong.

Đặc biệt:

- không copy QuanLyBanNganh để tạo Ban mới;
- không tạo deployment riêng cho mỗi Ban nếu không có lý do quota/security thực sự;
- create_new_ban phải là provisioning data, không scaffold source;
- scaffold_module chỉ dùng cho software module thực sự mới;
- không đổi tên header production khi chưa có migration;
- không xóa legacy API trước khi xác nhận không còn caller.

Bắt đầu bằng PHASE 0.
```

---

# 60. CHECKLIST REVIEW DÀNH CHO CHỦ DỰ ÁN

Trước khi chấp nhận một phase:

- [ ] Có backup?
- [ ] Có danh sách file sửa?
- [ ] Có test?
- [ ] Có rollback?
- [ ] Có làm mất chức năng cũ?
- [ ] Có hard-code ID mới?
- [ ] Có full refresh?
- [ ] Có loop setValue?
- [ ] Có tin sheetId client?
- [ ] Có vượt scope user?
- [ ] Có log nhạy cảm?
- [ ] Có cập nhật docs?
- [ ] Có benchmark?
- [ ] Có xác nhận GitHub Pages?
- [ ] Có xác nhận GAS Web App?

---

# 61. KẾT LUẬN KIẾN TRÚC

Kiến trúc cuối cùng cần được hiểu ngắn gọn như sau:

```text
MỘT REPO
    │
    ├── MASTER ENGINE
    │
    ├── MINISTRY ENGINE
    │
    └── FUTURE MODULE ENGINES
             │
             ▼

NHIỀU HỘI THÁNH
    │
    ├── NHIỀU BAN NGÀNH
    │      │
    │      └── MỖI BAN MỘT SHEET RIÊNG
    │
    └── REPORT THEO HỘI THÁNH

MASTER REGISTRY
    │
    ├── biết Ban thuộc Hội Thánh nào
    ├── biết Sheet nào thuộc Ban nào
    ├── biết user được vào đâu
    └── giữ snapshot để báo cáo nhanh
```

Điểm mấu chốt:

> **Tách DATA theo Hội Thánh/Ban Ngành nhưng dùng chung CODE theo software module.**

Nhờ đó hệ thống đạt đồng thời:

- dễ quản lý;
- dễ backup;
- dễ mở rộng;
- không nhân bản code;
- không deploy hàng chục bản giống nhau;
- báo cáo được theo Hội Thánh;
- báo cáo được toàn hệ thống;
- tối ưu tốt hơn với Google Apps Script;
- có lộ trình rõ để nâng cấp security, workflow và PWA;
- sẵn sàng migrate database trong tương lai nếu quy mô vượt Google Sheets.

---

# 62. NGUỒN HỢP NHẤT

Tài liệu này được hợp nhất từ các tài liệu dự án:

1. `GGSheet-QLHT_ToiUu_AppScript_Antigravity(1).md`
   - phân tích hiệu năng;
   - batch read/write;
   - frontend state;
   - lock;
   - cache/version;
   - API modularization;
   - acceptance criteria.

2. `HUONG_DAN_SU_DUNG.md`
   - flow tạo Hội Thánh;
   - tạo Ban Ngành;
   - tạo Google Sheet tự động;
   - cấu trúc Drive;
   - deploy/sync hiện tại.

3. `GGSheet-QLHT_Roadmap_10_10(1).md`
   - security;
   - permission;
   - Member 360;
   - Care Workflow;
   - dashboard;
   - reporting;
   - CRM;
   - audit;
   - backup;
   - PWA/QR;
   - testing.

4. Kiến trúc đã chốt:
   - nhiều Hội Thánh;
   - mỗi Hội Thánh nhiều Ban Ngành;
   - Hội Thánh là tenant cấp cao;
   - Ban Ngành là tenant con;
   - Shared Ministry Engine;
   - báo cáo 3 cấp: Ban → Hội Thánh → System.

---

**END OF MASTER SPECIFICATION**
