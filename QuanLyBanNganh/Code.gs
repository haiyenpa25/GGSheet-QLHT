/**
 * HỆ THỐNG QUẢN LÝ BAN NGÀNH (REST API & WEB APP ENGINE)
 * Google Apps Script Backend (Batch-Optimized & Multi-tenant Ready)
 */

const DEFAULT_SPREADSHEET_ID = '1qI_qFmXjbnnw21qPdxeWSUpBH9itFp6TznpAKMZZwME';

const SHEET_NAMES = {
  USERS: 'Users',
  THANH_VIEN: 'ThanhVien',
  TO_NHOM: 'ToNhom',
  DIEM_DANH: 'DiemDanh',
  THAM_VIENG: 'ThamVieng',
  LICH_QUY: 'LichQuy',
  CHU_DE: 'ChuDe',
  CAU_HINH: 'CauHinh',
  DANH_MUC_QUY: 'DanhMucQuy',
  SO_QUY: 'SoQuy',
  MAU_TIN_NHAN: 'MauTinNhan'
};

const SCHEMAS = {
  [SHEET_NAMES.USERS]: ['id', 'username', 'passwordHash', 'fullName', 'role', 'email', 'avatar', 'isActive', 'createdAt'],
  [SHEET_NAMES.THANH_VIEN]: ['id', 'maTV', 'hoTen', 'sdt', 'ngaySinh', 'gioiTinh', 'toId', 'chucVu', 'diaChi', 'trangThai', 'ghiChu', 'ngayTao'],
  [SHEET_NAMES.TO_NHOM]: ['id', 'maTo', 'tenTo', 'toTruong', 'toPho', 'soLuongThanhVien', 'lichSinhHoat', 'diaDiem', 'ghiChu'],
  [SHEET_NAMES.DIEM_DANH]: ['id', 'ngayDiemDanh', 'thanhVienId', 'coMat', 'thuocCauGoc', 'soCauKT', 'ghiChu', 'nguoiDiemDanh', 'createdAt'],
  [SHEET_NAMES.THAM_VIENG]: ['id', 'ngayTham', 'thanhVienId', 'nguoiTham', 'hinhThuc', 'noiDungCauNguyen', 'trangThai', 'mucDoUuTien', 'hanChot', 'ketQua', 'ngayTao'],
  [SHEET_NAMES.LICH_QUY]: ['id', 'nam', 'quy', 'tuanThu', 'ngayNhom', 'deTai', 'cauGoc', 'noiDungCauGoc', 'dienGia', 'huongDan', 'nguoiDoKT', 'amNhac', 'mayChieu', 'tiepTan', 'toPhuTrach', 'phuTrach', 'baiHatTonVinh', 'trangPhuc', 'gioNhom', 'ghiChu', 'trangThai'],
  [SHEET_NAMES.CHU_DE]: ['id', 'nam', 'quy', 'stt', 'chuDe', 'cauGoc', 'noiDungCauGoc', 'baiHatChuDe', 'mucTieu', 'khauHieu', 'trangThai'],
  [SHEET_NAMES.CAU_HINH]: ['key', 'value', 'description', 'updatedAt'],
  [SHEET_NAMES.DANH_MUC_QUY]: ['id', 'maQuy', 'tenQuy', 'soDuDauKy', 'moTa', 'trangThai', 'ngayTao'],
  [SHEET_NAMES.SO_QUY]: ['id', 'ngayGD', 'maQuy', 'loaiGD', 'hangMuc', 'soTien', 'nguoiNopNhan', 'nguoiThucHien', 'chungTu', 'ghiChu', 'ngayTao'],
  [SHEET_NAMES.MAU_TIN_NHAN]: ['id', 'maMau', 'tieuDe', 'loai', 'noiDung', 'moTa', 'trangThai']
};

// =========================================================================
// ENTRY POINTS: doGet & doPost
// =========================================================================

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }

  const sheetId = (e && e.parameter && e.parameter.sheetId) || DEFAULT_SPREADSHEET_ID;
  const banNganhId = (e && e.parameter && e.parameter.banNganhId) || 'id_41451e0a';
  const title = (e && e.parameter && e.parameter.title) || 'Ban Thanh Tráng';

  const template = HtmlService.createTemplateFromFile('Index');
  template.sheetId = sheetId;
  template.banNganhId = banNganhId;
  template.banNganhTitle = title;

  return template.evaluate()
    .setTitle(title ? `Quản Lý ${title}` : 'Quản Lý Ban Ngành - Hội Thánh')
    .setFaviconUrl('https://img.icons8.com/fluency/48/groups.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    const action = payload.action || (e && e.parameter && e.parameter.action);
    return handleApiRequest(action, payload);
  } catch (err) {
    return createJsonResponse({ success: false, message: 'Lỗi parse JSON: ' + err.message });
  }
}

function handleApiRequest(action, params) {
  try {
    let result = { success: false, message: 'Unknown action: ' + action };
    const sheetId = params.sheetId || params.customSheetId;

    switch (action) {
      case 'apiGetInitialData':
        result = apiGetInitialData(sheetId);
        break;
      case 'apiSaveMember':
        result = apiSaveMember(params.data || params, sheetId);
        break;
      case 'apiDeleteMember':
        result = apiDeleteMember(params.id, sheetId);
        break;
      case 'apiSaveGroup':
        result = apiSaveGroup(params.data || params, sheetId);
        break;
      case 'apiDeleteGroup':
        result = apiDeleteGroup(params.id, sheetId);
        break;
      case 'apiSaveAttendance':
        result = apiSaveAttendance(params.data || params, sheetId);
        break;
      case 'apiAddTransaction':
        result = apiAddTransaction(params.data || params, sheetId);
        break;
      case 'apiDeleteTransaction':
        result = apiDeleteTransaction(params.id, sheetId);
        break;
      case 'apiSaveSchedule':
        result = apiSaveSchedule(params.data || params, sheetId);
        break;
      case 'apiDeleteSchedule':
        result = apiDeleteSchedule(params.id, sheetId);
        break;
      case 'apiGenerateYearlySchedule':
        result = apiGenerateYearlySchedule(params.data || params, sheetId);
        break;
      case 'apiSaveAllThemes':
        result = apiSaveAllThemes(params.data || params, sheetId);
        break;
      case 'apiSaveVisitation':
        result = apiSaveVisitation(params.data || params, sheetId);
        break;
      case 'apiDeleteVisitation':
        result = apiDeleteVisitation(params.id, sheetId);
        break;
      case 'apiSyncDatabaseSchema':
        result = setupDatabase(sheetId);
        break;
      case 'apiBulkImportMembers':
        result = apiBulkImportMembers(params.data || params, sheetId);
        break;
      case 'apiBatchAssignGroup':
        result = apiBatchAssignGroup(params.memberIds || params.ids, params.toId, sheetId);
        break;
      default:
        result = { success: false, message: `Hành động "${action}" không tồn tại` };
    }

    return createJsonResponse(result);
  } catch (e) {
    return createJsonResponse({ success: false, message: e.message || String(e) });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet(customSheetId) {
  // 1. Nếu có customSheetId truyền từ URL (Master ánh xạ qua), thử mở theo ID đó
  if (customSheetId && String(customSheetId).trim()) {
    try {
      const cleanId = cleanIdFromInput(customSheetId);
      const ss = SpreadsheetApp.openById(cleanId);
      if (ss) return ss;
    } catch (err) {
      Logger.log('Không thể mở customSheetId: ' + err.message);
    }
  }

  // 2. Tự động nhận diện Container-bound Spreadsheet (Sheet chứa dự án)
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  // 3. Thử đọc từ Cài đặt đã lưu trong Properties
  const propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (propId && propId.trim()) {
    try {
      const ss = SpreadsheetApp.openById(propId.trim());
      if (ss) return ss;
    } catch (e) {}
  }

  // 4. Thử mở theo ID mặc định
  if (typeof DEFAULT_SPREADSHEET_ID !== 'undefined' && DEFAULT_SPREADSHEET_ID) {
    try {
      const ss = SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID.trim());
      if (ss) return ss;
    } catch (e) {}
  }

  throw new Error('Chưa kết nối Google Sheet! Vui lòng vào Cài Đặt trên Web App để dán link Google Sheet của bạn.');
}

function cleanIdFromInput(input) {
  if (!input) return '';
  let str = String(input).trim();
  const match = str.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return str;
}

function setupDatabase(sheetIdOrUrl) {
  let customId = '';
  if (sheetIdOrUrl) {
    customId = cleanIdFromInput(sheetIdOrUrl);
  }

  const ss = getSpreadsheet(customId);

  Object.keys(SCHEMAS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      const allSheets = ss.getSheets();
      if (allSheets.length === 1 && (allSheets[0].getName() === 'Sheet1' || allSheets[0].getName() === 'Trang tính1')) {
        sheet = allSheets[0];
        sheet.setName(sheetName);
      } else {
        sheet = ss.insertSheet(sheetName);
      }
    }

    const expectedHeaders = SCHEMAS[sheetName];
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow === 0 || lastCol === 0) {
      sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
      sheet.getRange(1, 1, 1, expectedHeaders.length)
        .setFontWeight('bold')
        .setBackground('#10b981')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      if (sheetName === SHEET_NAMES.TO_NHOM && sheet.getLastRow() === 1) {
        const defaultGroups = [
          ['to_1', 'TO_01', 'Tổ 1 - Ái Năng', 'Nguyễn Văn An', 'Trần Thị Mai', 5, 'Chiều Chúa Nhật 16h00', 'Phòng Nhóm 1', 'Tổ sinh hoạt tích cực'],
          ['to_2', 'TO_02', 'Tổ 2 - Trung Tín', 'Lê Hoàng Long', 'Phạm Thị Cúc', 6, 'Chiều Chúa Nhật 16h00', 'Phòng Nhóm 2', 'Tổ sinh hoạt trung tín'],
          ['to_3', 'TO_03', 'Tổ 3 - Đắc Thắng', 'Võ Minh Trí', 'Đặng Thùy Dung', 4, 'Chiều Chúa Nhật 16h00', 'Phòng Nhóm 3', 'Tổ thanh tráng trẻ']
        ];
        defaultGroups.forEach(r => sheet.appendRow(r));
      } else if (sheetName === SHEET_NAMES.THANH_VIEN && sheet.getLastRow() === 1) {
        const curDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
        const defaultMembers = [
          ['bv_1', 'BV01', 'Nguyễn Văn An', '0901234567', '15/05/1990', 'Nam', 'to_1', 'Trưởng Ban', '123 Đường Số 1, TP.HCM', 'active', 'Trưởng Ban Điều Hành', curDate],
          ['bv_2', 'BV02', 'Trần Thị Mai', '0912345678', '20/08/1992', 'Nữ', 'to_1', 'Thư Ký', '456 Đường Số 2, TP.HCM', 'active', 'Thư ký Ban', curDate],
          ['bv_3', 'BV03', 'Lê Hoàng Long', '0987654321', '10/12/1988', 'Nam', 'to_2', 'Thủ Quỹ', '789 Đường Số 3, TP.HCM', 'active', 'Thủ quỹ Ban', curDate],
          ['bv_4', 'BV04', 'Phạm Thị Cúc', '0933445566', '25/08/1995', 'Nữ', 'to_2', 'Ban viên', '101 Đường Số 4, TP.HCM', 'active', 'Ban viên tích cực', curDate],
          ['bv_5', 'BV05', 'Võ Minh Trí', '0977889900', '02/09/1991', 'Nam', 'to_3', 'Ban viên', '202 Đường Số 5, TP.HCM', 'active', 'Nhạc công Ban', curDate]
        ];
        defaultMembers.forEach(r => sheet.appendRow(r));
      } else if (sheetName === SHEET_NAMES.DANH_MUC_QUY && sheet.getLastRow() === 1) {
        sheet.appendRow(['q_ban', 'QUY_BAN', 'Quỹ Ban', 0, 'Quỹ sinh hoạt chính của Ban', 'active', Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy')]);
      } else if (sheetName === SHEET_NAMES.CHU_DE && sheet.getLastRow() === 1) {
        const curY = new Date().getFullYear();
        const defaultThemes = [
          ['t_year', curY, 'NAM', 0, 'KỶ LUẬT THUỘC LINH', 'I Ti-mô-thê 4:7-8', 'Hãy tập tành sự tin kính; vì sự tập tành thân thể ích lợi ít bề...', '', '', '', 'active'],
          ['t_q1', curY, 'I', 1, 'GIỮ VỮNG', 'Giô-suê 1:8', 'Quyển sách luật pháp này chớ xa miệng ngươi...', '', '', '', 'active'],
          ['t_q2', curY, 'II', 2, 'TĂNG TRƯỞNG', 'II Phi-e-rơ 3:18', 'Hãy tấn tới trong ân điển và trong sự thông biết Chúa...', '', '', '', 'active'],
          ['t_q3', curY, 'III', 3, 'VÂNG PHỤC', 'Hê-bơ-rơ 5:8', 'Dầu Ngài là Con, cũng đã học tập vâng lời...', '', '', '', 'active'],
          ['t_q4', curY, 'IV', 4, 'ĐẮC THẮNG', 'I Giăng 5:4', 'Vì hễ sự gì sanh bởi Đức Chúa Trời, thì thắng hơn thế gian...', '', '', '', 'active']
        ];
        defaultThemes.forEach(r => sheet.appendRow(r));
      } else if (sheetName === SHEET_NAMES.MAU_TIN_NHAN && sheet.getLastRow() === 1) {
        const defaultTpls = [
          ['tpl_1', 'SINH_NHAT', 'Chúc Mừng Sinh Nhật', 'birthday', '🎂 Kính chúc mừng sinh nhật {{hoTen}}! Chúc bạn tuổi mới tràn đầy ơn phước từ Chúa Giê-xu!', 'Mẫu tin nhắn chúc mừng sinh nhật', 'active'],
          ['tpl_2', 'THAM_HOI', 'Thăm Hỏi Vắng Nhóm', 'absence_care', '❤️ Thân gửi {{hoTen}} ({{tenTo}})! Chúa Nhật vừa qua Ban rất nhớ bạn. Mong gặp lại bạn chiều CN tuần này!', 'Mẫu thăm hỏi khích lệ', 'active'],
          ['tpl_3', 'LICH_TRUC', 'Nhắc Lịch Phân Công', 'schedule_duty', '📅 Thông báo lịch phân công Chúa Nhật: {{ngayNhom}} lúc 16h00. Kính mời {{hoTen}} sắp xếp tham dự!', 'Mẫu nhắc phân công trực', 'active']
        ];
        defaultTpls.forEach(r => sheet.appendRow(r));
      }
    }
  });

  return {
    success: true,
    message: 'Khởi tạo và đồng bộ chuẩn hóa cấu trúc Google Sheet thành công!',
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl()
  };
}

function normalizeHeaderKey(header) {
  if (!header) return '';
  const raw = String(header).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  const map = {
    'id': 'id',
    'matv': 'maTV',
    'mabv': 'maTV',
    'code': 'maTV',
    'hoten': 'hoTen',
    'hovaten': 'hoTen',
    'fullname': 'hoTen',
    'name': 'hoTen',
    'ten': 'hoTen',
    'tenbanvien': 'hoTen',
    'sdt': 'sdt',
    'dienthoai': 'sdt',
    'phone': 'sdt',
    'phonenumber': 'sdt',
    'ngaysinh': 'ngaySinh',
    'dob': 'ngaySinh',
    'birthdate': 'ngaySinh',
    'gioitinh': 'gioiTinh',
    'gender': 'gioiTinh',
    'toid': 'toId',
    'to': 'toId',
    'tonhom': 'toId',
    'groupid': 'toId',
    'chucvu': 'chucVu',
    'role': 'chucVu',
    'diachi': 'diaChi',
    'address': 'diaChi',
    'trangthai': 'trangThai',
    'status': 'trangThai',
    'ghichu': 'ghiChu',
    'note': 'ghiChu',
    'notes': 'ghiChu',
    'ngaytao': 'ngayTao',
    'createdat': 'ngayTao',

    // Tổ nhóm
    'mato': 'maTo',
    'tento': 'tenTo',
    'totruong': 'toTruong',
    'topho': 'toPho',
    'lichsinhhoat': 'lichSinhHoat',
    'diadiem': 'diaDiem',

    // Sổ quỹ
    'ngaygd': 'ngayGD',
    'date': 'ngayGD',
    'maquy': 'maQuy',
    'loaigd': 'loaiGD',
    'type': 'loaiGD',
    'hangmuc': 'hangMuc',
    'noidung': 'hangMuc',
    'sotien': 'soTien',
    'amount': 'soTien',
    'nguoinopnhan': 'nguoiNopNhan',
    'nguoithuchien': 'nguoiThucHien',

    // Điểm danh
    'ngaydiemdanh': 'ngayDiemDanh',
    'thanhvienid': 'thanhVienId',
    'comat': 'coMat',
    'thuoccaugoc': 'thuocCauGoc',
    'socaukt': 'soCauKT',
    'cauktdap': 'soCauKT',
    'kinhthanhdap': 'soCauKT',
    'socaukinhthanh': 'soCauKT',
    'caukt': 'soCauKT',

    // Thăm viếng & Care Cases
    'ngaytham': 'ngayTham',
    'nguoitham': 'nguoiTham',
    'noidungcaunguyen': 'noiDungCauNguyen',
    'noidung': 'noiDungCauNguyen',
    'mucdouutien': 'mucDoUuTien',
    'priority': 'mucDoUuTien',
    'uutien': 'mucDoUuTien',
    'domucuutien': 'mucDoUuTien',
    'hanchot': 'hanChot',
    'deadline': 'hanChot',
    'ngayhanchot': 'hanChot',
    'ketqua': 'ketQua',
    'result': 'ketQua',

    // Lịch sinh hoạt & Phân công nhân sự
    'nam': 'nam',
    'year': 'nam',
    'quy': 'quy',
    'quarter': 'quy',
    'tuanthu': 'tuanThu',
    'week': 'tuanThu',
    'ngaynhom': 'ngayNhom',
    'detai': 'deTai',
    'topic': 'deTai',
    'caugoc': 'cauGoc',
    'verse': 'cauGoc',
    'noidungcaugoc': 'noiDungCauGoc',
    'dokt': 'doKT',
    'nguoidokt': 'nguoiDoKT',
    'phutrachdokt': 'nguoiDoKT',
    'tophutrach': 'toPhuTrach',
    'phutrach': 'phuTrach',
    'giangluan': 'dienGia',
    'diengia': 'dienGia',
    'nguoichiase': 'dienGia',
    'chiase': 'dienGia',
    'huongdan': 'huongDan',
    'hdct': 'huongDan',
    'nguoihd': 'huongDan',
    'amnhac': 'amNhac',
    'nhaccong': 'amNhac',
    'piano': 'amNhac',
    'organ': 'amNhac',
    'guitar': 'amNhac',
    'maychieu': 'mayChieu',
    'trinhchieu': 'mayChieu',
    'chieu': 'mayChieu',
    'kythuat': 'mayChieu',
    'tieptan': 'tiepTan',
    'chaochuc': 'tiepTan',
    'bantieptan': 'tiepTan',
    'caunguyen': 'cauNguyen',
    'banhat': 'baiHatTonVinh',
    'baihattonvinh': 'baiHatTonVinh',
    'baihat': 'baiHatTonVinh',
    'baihatchude': 'baiHatChuDe',
    'trangphuc': 'trangPhuc',
    'gionhom': 'gioNhom',
    'time': 'gioNhom',

    // Chủ đề
    'chude': 'chuDe',
    'theme': 'chuDe'
  };

  return map[raw] || header;
}

function parseRowsFromValues(data) {
  if (!data || data.length <= 1) return [];
  const headers = data[0].map(h => String(h).trim());
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] && row.every(c => c === '')) continue;

    const item = { _rowIndex: i + 1 };
    headers.forEach((h, colIdx) => {
      let val = row[colIdx];
      if (val === undefined || val === null) {
        val = '';
      } else if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
      } else if (typeof val === 'number') {
        val = isNaN(val) ? 0 : val;
      } else if (typeof val === 'boolean') {
        val = val;
      } else {
        val = String(val);
      }
      item[h] = val;
      const normalized = normalizeHeaderKey(h);
      if (normalized && item[normalized] === undefined) {
        item[normalized] = val;
      }
    });
    results.push(item);
  }
  return results;
}

function sheetFindAll(sheetName, customSheetId) {
  const ss = getSpreadsheet(customSheetId);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupDatabase(customSheetId);
    sheet = ss.getSheetByName(sheetName);
  }
  const data = sheet.getDataRange().getValues();
  return parseRowsFromValues(data);
}

function sheetInsert(sheetName, record, customSheetId) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch(e) {}
  try {
    const ss = getSpreadsheet(customSheetId);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      setupDatabase(customSheetId);
      sheet = ss.getSheetByName(sheetName);
    }

    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
    if (!record.id) {
      record.id = 'id_' + Utilities.getUuid().substring(0, 8);
    }
    if (!record.ngayTao && !record.createdAt) {
      record.ngayTao = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    }

    const row = headers.map(h => {
      const norm = normalizeHeaderKey(h);
      if (record[h] !== undefined) return record[h];
      if (norm && record[norm] !== undefined) return record[norm];
      return '';
    });

    sheet.appendRow(row);
    return record;
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function sheetUpdate(sheetName, id, updates, customSheetId) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch(e) {}
  try {
    const ss = getSpreadsheet(customSheetId);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Không tìm thấy sheet ${sheetName}`);

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol === 0) throw new Error(`Không tìm thấy bản ghi với ID ${id}`);

    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0].map(h => String(h).trim());
    const idIdx = headers.indexOf('id') !== -1 ? headers.indexOf('id') : 0;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIdx]) === String(id) || String(data[i][0]) === String(id)) {
        const currentRow = data[i];
        const updatedRow = [...currentRow];
        const updatedObj = { id: id };

        headers.forEach((h, colIdx) => {
          const norm = normalizeHeaderKey(h);
          if (updates[h] !== undefined) {
            updatedRow[colIdx] = updates[h];
          } else if (norm && updates[norm] !== undefined) {
            updatedRow[colIdx] = updates[norm];
          }
          updatedObj[h] = updatedRow[colIdx];
          if (norm) updatedObj[norm] = updatedRow[colIdx];
        });

        // 1 LẦN BATCH WRITE DUY NHẤT CHO TOÀN BỘ DÒNG
        sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
        return updatedObj;
      }
    }
    throw new Error(`Không tìm thấy bản ghi với ID ${id}`);
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function sheetDelete(sheetName, id, customSheetId) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch(e) {}
  try {
    const ss = getSpreadsheet(customSheetId);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Không tìm thấy sheet ${sheetName}`);

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol === 0) throw new Error(`Không tìm thấy bản ghi với ID ${id}`);

    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0].map(h => String(h).trim());
    const idColIdx = headers.indexOf('id') !== -1 ? headers.indexOf('id') : 0;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idColIdx]) === String(id) || String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true, id: id, message: 'Đã xóa bản ghi' };
      }
    }
    throw new Error(`Không tìm thấy bản ghi với ID ${id}`);
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

// =========================================================================
// API HANDLERS (OPTIMIZED BATCH DATA INITIALIZATION)
// =========================================================================

function apiGetInitialData(customSheetId) {
  try {
    const ss = getSpreadsheet(customSheetId);
    const allSheets = ss.getSheets();
    const sheetMap = {};

    allSheets.forEach(s => {
      const name = s.getName();
      const lastRow = s.getLastRow();
      const lastCol = s.getLastColumn();
      if (lastRow > 0 && lastCol > 0) {
        sheetMap[name] = s.getRange(1, 1, lastRow, lastCol).getValues();
      } else {
        sheetMap[name] = [];
      }
    });

    function getSheetValuesByName(targetName, aliases = []) {
      if (sheetMap[targetName] && sheetMap[targetName].length > 0) return sheetMap[targetName];
      const keys = Object.keys(sheetMap);
      const targetNorm = targetName.toLowerCase().replace(/[\s_-]/g, '');
      const match = keys.find(k => k.toLowerCase().replace(/[\s_-]/g, '') === targetNorm);
      if (match && sheetMap[match].length > 0) return sheetMap[match];
      for (let alias of aliases) {
        if (sheetMap[alias] && sheetMap[alias].length > 0) return sheetMap[alias];
        const aliasNorm = alias.toLowerCase().replace(/[\s_-]/g, '');
        const aliasMatch = keys.find(k => k.toLowerCase().replace(/[\s_-]/g, '') === aliasNorm);
        if (aliasMatch && sheetMap[aliasMatch].length > 0) return sheetMap[aliasMatch];
      }
      return [];
    }

    const memberValues = getSheetValuesByName(SHEET_NAMES.THANH_VIEN, ['Thành Viên', 'Ban Viên', 'BanVien', 'Thanh Vien']);
    const groupValues = getSheetValuesByName(SHEET_NAMES.TO_NHOM, ['Tổ Nhóm', 'To Nhom', 'Tổ', 'To']);
    const fundValues = getSheetValuesByName(SHEET_NAMES.DANH_MUC_QUY, ['Danh Mục Quỹ', 'DanhMuc', 'Quy']);
    const transValues = getSheetValuesByName(SHEET_NAMES.SO_QUY, ['Sổ Quỹ', 'So Quy', 'ThuChi', 'Thu Chi']);
    const attValues = getSheetValuesByName(SHEET_NAMES.DIEM_DANH, ['Điểm Danh', 'Diem Danh', 'DiemDanh']);
    const visitValues = getSheetValuesByName(SHEET_NAMES.THAM_VIENG, ['Thăm Viếng', 'Tham Vieng', 'ChamSoc', 'Chăm Sóc']);
    const schedValues = getSheetValuesByName(SHEET_NAMES.LICH_QUY, ['Lịch Quý', 'Lich Quy', 'LichSinhHoat', 'Lịch Sinh Hoạt']);
    const themeValues = getSheetValuesByName(SHEET_NAMES.CHU_DE, ['Chủ Đề', 'Chu De']);
    const tplValues = getSheetValuesByName(SHEET_NAMES.MAU_TIN_NHAN, ['Mẫu Tin Nhắn', 'Mau Tin Nhan']);

    const members = parseRowsFromValues(memberValues);
    const groups = parseRowsFromValues(groupValues);
    const funds = parseRowsFromValues(fundValues);
    const transactions = parseRowsFromValues(transValues);
    const attendances = parseRowsFromValues(attValues);
    const visits = parseRowsFromValues(visitValues);
    const schedules = parseRowsFromValues(schedValues);
    const themes = parseRowsFromValues(themeValues);
    let templates = parseRowsFromValues(tplValues);

    if (!templates || templates.length === 0) {
      templates = [
        { id: 'tpl_1', maMau: 'SINH_NHAT', tieuDe: 'Chúc Mừng Sinh Nhật', loai: 'birthday', noiDung: '🎂 Kính chúc mừng sinh nhật {{hoTen}}! Chúc bạn tuổi mới tràn đầy ơn phước từ Chúa Giê-xu!', moTa: 'Mẫu tin nhắn chúc mừng sinh nhật', trangThai: 'active' },
        { id: 'tpl_2', maMau: 'THAM_HOI', tieuDe: 'Thăm Hỏi Vắng Nhóm', loai: 'absence_care', noiDung: '❤️ Thân gửi {{hoTen}} ({{tenTo}})! Chúa Nhật vừa qua Ban rất nhớ bạn. Mong gặp lại bạn chiều CN tuần này!', moTa: 'Mẫu thăm hỏi khích lệ', trangThai: 'active' },
        { id: 'tpl_3', maMau: 'LICH_TRUC', tieuDe: 'Nhắc Lịch Phân Công', loai: 'schedule_duty', noiDung: '📅 Thông báo lịch phân công Chúa Nhật: {{ngayNhom}} lúc 16h00. Kính mời {{hoTen}} sắp xếp tham dự!', moTa: 'Mẫu nhắc phân công trực', trangThai: 'active' }
      ];
    }

    let totalBalance = 0;
    transactions.forEach(t => {
      const amount = Number(t.soTien) || 0;
      const type = (t.loaiGD || '').toUpperCase();
      if (type === 'THU') totalBalance += amount;
      else if (type === 'CHI') totalBalance -= amount;
    });

    // Default Theme
    let activeTheme = {
      chuDe: 'KỶ LUẬT THUỘC LINH',
      cauGoc: 'I Ti-mô-thê 4:7-8',
      noiDungCauGoc: 'Hãy tập tành sự tin kính; vì sự tập tành thân thể ích lợi ít bề, còn sự tin kính ích cho mọi sự, có lời hứa về đời này và đời sau nữa.'
    };

    if (themes && themes.length > 0) {
      const yearTheme = themes.find(t => String(t.quy || '').toUpperCase() === 'NAM') || themes[0];
      if (yearTheme) {
        activeTheme = {
          chuDe: yearTheme.chuDe || activeTheme.chuDe,
          cauGoc: yearTheme.cauGoc || activeTheme.cauGoc,
          noiDungCauGoc: yearTheme.noiDungCauGoc || activeTheme.noiDungCauGoc
        };
      }
    }

    return {
      success: true,
      data: {
        kpis: {
          total_members: members.length,
          active_members: members.filter(m => (m.trangThai || 'active') === 'active').length,
          group_count: groups.length,
          total_balance: totalBalance,
          total_attendance_records: attendances.length,
          total_visits: visits.length,
          total_schedules: schedules.length
        },
        theme: activeTheme,
        themes: themes,
        members: members,
        groups: groups,
        funds: funds,
        transactions: transactions.reverse(),
        attendances: attendances,
        visits: visits.reverse(),
        schedules: schedules,
        templates: templates,
        spreadsheet: {
          id: ss.getId(),
          name: ss.getName(),
          url: ss.getUrl()
        }
      }
    };
  } catch (err) {
    Logger.log('apiGetInitialData Error: ' + err.message);
    return { success: false, message: err.message || String(err) };
  }
}

function apiSaveMember(payload, customSheetId) {
  try {
    const hoTen = payload.hoTen || payload.HoTen || payload.fullName;
    if (!hoTen) throw new Error('Họ tên ban viên không được để trống');
    payload.hoTen = hoTen;
    payload.trangThai = payload.trangThai || 'active';
    payload.maTV = payload.maTV || ('BV' + Math.floor(100 + Math.random() * 900));

    let res = payload.id ? sheetUpdate(SHEET_NAMES.THANH_VIEN, payload.id, payload, customSheetId) : sheetInsert(SHEET_NAMES.THANH_VIEN, payload, customSheetId);
    return { success: true, data: res, message: 'Đã lưu ban viên thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiDeleteMember(id, customSheetId) {
  try {
    sheetDelete(SHEET_NAMES.THANH_VIEN, id, customSheetId);
    return { success: true, id: id, message: 'Đã xóa ban viên thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiBulkImportMembers(payload, customSheetId) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(6000); } catch(e) {}
  try {
    const membersList = payload.members || payload.list || [];
    if (!Array.isArray(membersList) || membersList.length === 0) {
      throw new Error('Danh sách ban viên nhập vào trống');
    }

    const ss = getSpreadsheet(customSheetId);
    let groupSheet = ss.getSheetByName(SHEET_NAMES.TO_NHOM);
    let memberSheet = ss.getSheetByName(SHEET_NAMES.THANH_VIEN);

    if (!groupSheet || !memberSheet) {
      setupDatabase(customSheetId);
      groupSheet = ss.getSheetByName(SHEET_NAMES.TO_NHOM);
      memberSheet = ss.getSheetByName(SHEET_NAMES.THANH_VIEN);
    }

    // 1. Group Map
    const groupLastRow = groupSheet.getLastRow();
    const groupLastCol = groupSheet.getLastColumn();
    let groupHeaders = groupSheet.getRange(1, 1, 1, groupLastCol).getValues()[0].map(h => String(h).trim());
    let groupData = groupLastRow > 1 ? groupSheet.getRange(2, 1, groupLastRow - 1, groupLastCol).getValues() : [];

    const groupMapByName = new Map();
    const groupMapById = new Map();
    const groupNormHeaders = groupHeaders.map(h => normalizeHeaderKey(h));
    const gIdIdx = groupNormHeaders.indexOf('id') !== -1 ? groupNormHeaders.indexOf('id') : 0;
    const gNameIdx = groupNormHeaders.indexOf('tento') !== -1 ? groupNormHeaders.indexOf('tento') : 1;

    groupData.forEach(r => {
      const id = String(r[gIdIdx]);
      const name = String(r[gNameIdx]).trim();
      if (id) groupMapById.set(id, { id, name });
      if (name) groupMapByName.set(normalizeHeaderKey(name), { id, name });
    });

    const newGroupRows = [];

    // 2. Member Map
    const memberLastRow = memberSheet.getLastRow();
    const memberLastCol = memberSheet.getLastColumn();
    let memberHeaders = memberSheet.getRange(1, 1, 1, memberLastCol).getValues()[0].map(h => String(h).trim());
    let memberData = memberLastRow > 1 ? memberSheet.getRange(2, 1, memberLastRow - 1, memberLastCol).getValues() : [];

    const memberNormHeaders = memberHeaders.map(h => normalizeHeaderKey(h));
    const mIdIdx = memberNormHeaders.indexOf('id') !== -1 ? memberNormHeaders.indexOf('id') : 0;
    const mNameIdx = memberNormHeaders.indexOf('hoten') !== -1 ? memberNormHeaders.indexOf('hoten') : 1;

    const memberMapByName = new Map();
    memberData.forEach((r, rowIdx) => {
      const name = String(r[mNameIdx]).trim().toLowerCase();
      if (name) memberMapByName.set(name, { rowIndex: rowIdx + 2, row: r });
    });

    const newMemberRows = [];
    let updatedCount = 0;
    let createdCount = 0;

    membersList.forEach((m) => {
      const hoTen = (m.hoTen || m.HoTen || m['HỌ VÀ TÊN'] || m.name || '').trim();
      if (!hoTen) return;

      let toId = m.toId || '';
      const toName = (m.to || m.toName || m.tenTo || '').trim();

      if (!toId && toName) {
        const normToName = normalizeHeaderKey(toName);
        if (groupMapByName.has(normToName)) {
          toId = groupMapByName.get(normToName).id;
        } else {
          // Tạo tổ mới trong RAM
          const newGId = 'TO_' + Math.floor(100 + Math.random() * 900);
          const newGRow = groupHeaders.map(h => {
            const norm = normalizeHeaderKey(h);
            if (norm === 'id') return newGId;
            if (norm === 'mato') return 'TO_' + (groupMapByName.size + newGroupRows.length + 1);
            if (norm === 'tento') return toName;
            if (norm === 'ghichu') return 'Tổ sinh hoạt ' + toName;
            return '';
          });
          newGroupRows.push(newGRow);
          const gObj = { id: newGId, name: toName };
          groupMapByName.set(normToName, gObj);
          toId = newGId;
        }
      }

      const existing = memberMapByName.get(hoTen.toLowerCase());
      const memberObj = {
        id: existing ? existing.row[mIdIdx] : ('id_' + Utilities.getUuid().substring(0, 8)),
        maTV: m.maTV || ('BV' + String(memberMapByName.size + newMemberRows.length + 1).padStart(3, '0')),
        hoTen: hoTen,
        sdt: m.sdt || m.SDT || m.phone || '',
        ngaySinh: m.ngaySinh || m['NGÀY SINH'] || m.dob || '',
        gioiTinh: m.gioiTinh || m.gender || 'Nam',
        toId: toId,
        chucVu: m.chucVu || m.role || 'Ban viên',
        diaChi: m.diaChi || m['ĐỊA CHỈ'] || m.address || '',
        trangThai: m.trangThai || 'active',
        ghiChu: m.ghiChu || '',
        ngayTao: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss')
      };

      if (existing) {
        // Cập nhật dòng hiện có
        const updatedRow = [...existing.row];
        memberHeaders.forEach((h, cIdx) => {
          const norm = normalizeHeaderKey(h);
          if (memberObj[h] !== undefined) updatedRow[cIdx] = memberObj[h];
          else if (norm && memberObj[norm] !== undefined) updatedRow[cIdx] = memberObj[norm];
        });
        memberSheet.getRange(existing.rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
        updatedCount++;
      } else {
        // Chuẩn bị batch insert
        const row = memberHeaders.map(h => {
          const norm = normalizeHeaderKey(h);
          if (memberObj[h] !== undefined) return memberObj[h];
          if (norm && memberObj[norm] !== undefined) return memberObj[norm];
          return '';
        });
        newMemberRows.push(row);
        createdCount++;
      }
    });

    // Batch insert new groups if any
    if (newGroupRows.length > 0) {
      groupSheet.getRange(groupLastRow + 1, 1, newGroupRows.length, groupHeaders.length).setValues(newGroupRows);
    }

    // Batch insert new members if any
    if (newMemberRows.length > 0) {
      memberSheet.getRange(memberLastRow + 1, 1, newMemberRows.length, memberHeaders.length).setValues(newMemberRows);
    }

    return {
      success: true,
      message: `Đã nhập thành công ${createdCount + updatedCount} ban viên (${createdCount} thêm mới, ${updatedCount} cập nhật)!`,
      count: createdCount + updatedCount,
      createdCount: createdCount,
      updatedCount: updatedCount
    };
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function apiSaveGroup(payload, customSheetId) {
  try {
    const tenTo = payload.tenTo || payload.TenTo;
    if (!tenTo) throw new Error('Tên tổ không được để trống');
    payload.tenTo = tenTo;
    payload.maTo = payload.maTo || ('TO_' + Math.floor(10 + Math.random() * 90));

    let res = payload.id ? sheetUpdate(SHEET_NAMES.TO_NHOM, payload.id, payload, customSheetId) : sheetInsert(SHEET_NAMES.TO_NHOM, payload, customSheetId);
    return { success: true, data: res, message: 'Đã lưu tổ nhóm thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiDeleteGroup(id, customSheetId) {
  try {
    sheetDelete(SHEET_NAMES.TO_NHOM, id, customSheetId);
    return { success: true, id: id, message: 'Đã xóa tổ nhóm thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSaveAttendance(payload, customSheetId) {
  try {
    if (!payload.ngayDiemDanh) throw new Error('Vui lòng chọn ngày điểm danh');
    if (!payload.records || !Array.isArray(payload.records)) throw new Error('Dữ liệu điểm danh không hợp lệ');

    const lock = LockService.getScriptLock();
    try { lock.waitLock(8000); } catch(e) {}
    try {
      const ss = getSpreadsheet(customSheetId);
      let sheet = ss.getSheetByName(SHEET_NAMES.DIEM_DANH);
      if (!sheet) {
        setupDatabase(customSheetId);
        sheet = ss.getSheetByName(SHEET_NAMES.DIEM_DANH);
      }

      const allData = sheet.getDataRange().getValues();
      let headers = (allData.length > 0 && allData[0][0]) ? allData[0].map(h => String(h).trim()) : SCHEMAS[SHEET_NAMES.DIEM_DANH];
      const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
      
      const targetDate = String(payload.ngayDiemDanh).trim();
      const dateColIdx = headers.indexOf('ngayDiemDanh') !== -1 ? headers.indexOf('ngayDiemDanh') : 1;

      // Đảm bảo headers có soCauKT nếu chưa có
      if (headers.indexOf('soCauKT') === -1) {
        const ghiChuIdx = headers.indexOf('ghiChu');
        if (ghiChuIdx !== -1) {
          headers.splice(ghiChuIdx, 0, 'soCauKT');
        } else {
          headers.push('soCauKT');
        }
      }

      // Lọc bỏ dữ liệu cũ của ngày này để tránh bị trùng lặp
      const retainedRows = [headers];
      if (allData.length > 1) {
        for (let i = 1; i < allData.length; i++) {
          const row = allData[i];
          if (!row[0] && row.every(c => c === '')) continue;
          if (String(row[dateColIdx]).trim() !== targetDate) {
            retainedRows.push(row);
          }
        }
      }

      const savedRecords = [];
      payload.records.forEach(rec => {
        const record = {
          id: 'att_' + Utilities.getUuid().substring(0, 8),
          ngayDiemDanh: targetDate,
          thanhVienId: rec.thanhVienId,
          coMat: (rec.coMat === true || rec.coMat === 'CO_MAT') ? 'CO_MAT' : 'VANG',
          thuocCauGoc: (rec.thuocCauGoc === true || rec.thuocCauGoc === 'THUOC') ? 'THUOC' : 'CHUA_THUOC',
          soCauKT: parseInt(rec.soCauKT, 10) || 0,
          ghiChu: rec.ghiChu || '',
          nguoiDiemDanh: payload.nguoiDiemDanh || 'Thư Ký',
          createdAt: nowStr
        };
        savedRecords.push(record);
        const row = headers.map(h => {
          const norm = normalizeHeaderKey(h);
          if (record[h] !== undefined) return record[h];
          if (record[norm] !== undefined) return record[norm];
          return '';
        });
        retainedRows.push(row);
      });

      sheet.clearContents();
      sheet.getRange(1, 1, retainedRows.length, headers.length).setValues(retainedRows);

      return { 
        success: true, 
        message: `Đã lưu điểm danh ngày ${targetDate} cho ${payload.records.length} ban viên thành công!`,
        savedDate: targetDate,
        records: savedRecords
      };
    } finally {
      try { lock.releaseLock(); } catch(e) {}
    }
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiAddTransaction(payload, customSheetId) {
  try {
    if (!payload.soTien || Number(payload.soTien) <= 0) throw new Error('Số tiền phải lớn hơn 0');
    if (!payload.hangMuc) throw new Error('Vui lòng nhập nội dung / hạng mục');

    const res = sheetInsert(SHEET_NAMES.SO_QUY, {
      ngayGD: payload.ngayGD || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
      maQuy: payload.maQuy || 'QUY_HOAT_DONG',
      loaiGD: payload.loaiGD || 'THU',
      hangMuc: payload.hangMuc,
      soTien: Number(payload.soTien),
      nguoiNopNhan: payload.nguoiNopNhan || '',
      nguoiThucHien: payload.nguoiThucHien || 'Thủ Quỹ',
      chungTu: payload.chungTu || '',
      ghiChu: payload.ghiChu || ''
    }, customSheetId);

    return { success: true, data: res, message: 'Đã lưu giao dịch sổ quỹ thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiDeleteTransaction(id, customSheetId) {
  try {
    sheetDelete(SHEET_NAMES.SO_QUY, id, customSheetId);
    return { success: true, message: 'Đã xóa giao dịch thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSaveSchedule(payload, customSheetId) {
  try {
    if (!payload.ngayNhom) throw new Error('Ngày nhóm không được để trống');
    if (!payload.deTai) throw new Error('Đề tài không được để trống');

    let res = payload.id ? sheetUpdate(SHEET_NAMES.LICH_QUY, payload.id, payload, customSheetId) : sheetInsert(SHEET_NAMES.LICH_QUY, payload, customSheetId);
    return { success: true, data: res, message: 'Đã lưu buổi sinh hoạt thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiDeleteSchedule(id, customSheetId) {
  try {
    sheetDelete(SHEET_NAMES.LICH_QUY, id, customSheetId);
    return { success: true, message: 'Đã xóa buổi sinh hoạt thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiGenerateYearlySchedule(payload, customSheetId) {
  try {
    const year = parseInt(payload.nam || payload.year || new Date().getFullYear(), 10);
    const dayOfWeek = parseInt(payload.dayOfWeek !== undefined ? payload.dayOfWeek : 0, 10); // 0 = Sunday, 1 = Monday...
    const defaultTime = payload.defaultTime || '16:00';
    const defaultTopic = payload.defaultTopic || 'HỌC KINH THÁNH';

    const ss = getSpreadsheet(customSheetId);
    let sheet = ss.getSheetByName(SHEET_NAMES.LICH_QUY);
    if (!sheet) {
      setupDatabase(customSheetId);
      sheet = ss.getSheetByName(SHEET_NAMES.LICH_QUY);
    }

    // Get existing dates to avoid duplicating
    const existingRows = parseRowsFromValues(sheet.getDataRange().getValues());
    const existingDates = {};
    existingRows.forEach(r => {
      if (r.ngayNhom) existingDates[r.ngayNhom] = true;
    });

    // Get Themes if available
    let chuDeRows = [];
    let sheetChuDe = ss.getSheetByName(SHEET_NAMES.CHU_DE);
    if (sheetChuDe) {
      chuDeRows = parseRowsFromValues(sheetChuDe.getDataRange().getValues());
    }
    const themeMap = {};
    chuDeRows.forEach(cd => {
      if (cd.quy) themeMap[String(cd.quy).toUpperCase()] = cd;
    });

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
    const newRecords = [];

    // Loop through all target days in the year
    let curDate = new Date(year, 0, 1);
    while (curDate.getDay() !== dayOfWeek) {
      curDate.setDate(curDate.getDate() + 1);
    }

    let weekNum = 1;
    while (curDate.getFullYear() === year) {
      const month = curDate.getMonth() + 1; // 1 - 12
      let quy = 'I';
      if (month >= 4 && month <= 6) quy = 'II';
      else if (month >= 7 && month <= 9) quy = 'III';
      else if (month >= 10 && month <= 12) quy = 'IV';

      const d = ('0' + curDate.getDate()).slice(-2);
      const m = ('0' + month).slice(-2);
      const ngayNhomFormatted = `${d}/${m}/${year}`;

      if (!existingDates[ngayNhomFormatted]) {
        const themeQ = themeMap[quy] || {};
        const rec = {
          id: 'sch_' + Utilities.getUuid().substring(0, 8),
          nam: year,
          quy: quy,
          tuanThu: weekNum,
          ngayNhom: ngayNhomFormatted,
          deTai: defaultTopic,
          cauGoc: themeQ.cauGoc || '',
          noiDungCauGoc: themeQ.noiDungCauGoc || '',
          doKT: '',
          nguoiDoKT: '',
          huongDan: '',
          toPhuTrach: '',
          phuTrach: 'BĐH',
          baiHatTonVinh: themeQ.baiHatChuDe || 'DÂNG CHÚA LỜI NGỢI CA',
          trangPhuc: 'Nam: áo sơ mi + cavat, Nữ: áo dài tự do',
          gioNhom: defaultTime,
          ghiChu: '',
          trangThai: 'active'
        };

        const rowValues = headers.map(h => {
          const norm = normalizeHeaderKey(h);
          if (rec[h] !== undefined) return rec[h];
          if (rec[norm] !== undefined) return rec[norm];
          return '';
        });
        newRecords.push(rowValues);
      }

      curDate.setDate(curDate.getDate() + 7);
      weekNum++;
    }

    if (newRecords.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, newRecords.length, headers.length).setValues(newRecords);
    }

    return {
      success: true,
      count: newRecords.length,
      message: `Đã tự động tạo thành công ${newRecords.length} buổi sinh hoạt cho năm ${year}!`
    };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSaveAllThemes(payload, customSheetId) {
  try {
    const list = payload.themes || payload.data || payload;
    if (!Array.isArray(list)) throw new Error('Dữ liệu chủ đề không hợp lệ');

    const ss = getSpreadsheet(customSheetId);
    let sheet = ss.getSheetByName(SHEET_NAMES.CHU_DE);
    if (!sheet) {
      setupDatabase(customSheetId);
      sheet = ss.getSheetByName(SHEET_NAMES.CHU_DE);
    }

    list.forEach(t => {
      if (t.id) {
        try { sheetUpdate(SHEET_NAMES.CHU_DE, t.id, t, customSheetId); } catch(e) { sheetInsert(SHEET_NAMES.CHU_DE, t, customSheetId); }
      } else {
        sheetInsert(SHEET_NAMES.CHU_DE, t, customSheetId);
      }
    });

    return { success: true, message: 'Đã lưu thông tin chủ đề năm và 4 quý thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSaveVisitation(payload, customSheetId) {
  try {
    if (!payload.thanhVienId) throw new Error('Vui lòng chọn ban viên được thăm viếng');
    if (!payload.ngayTham) throw new Error('Vui lòng chọn ngày thăm');

    let res = payload.id ? sheetUpdate(SHEET_NAMES.THAM_VIENG, payload.id, payload, customSheetId) : sheetInsert(SHEET_NAMES.THAM_VIENG, payload, customSheetId);
    return { success: true, data: res, message: 'Đã lưu phiếu thăm viếng thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiDeleteVisitation(id, customSheetId) {
  try {
    sheetDelete(SHEET_NAMES.THAM_VIENG, id, customSheetId);
    return { success: true, id: id, message: 'Đã xóa phiếu thăm viếng thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSyncDatabaseSchema(customSheetId) {
  return setupDatabase(customSheetId);
}

function apiBatchAssignGroup(memberIds, toId, customSheetId) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch(e) {}
  try {
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      throw new Error('Chưa chọn ban viên nào');
    }

    const ss = getSpreadsheet(customSheetId);
    const sheet = ss.getSheetByName(SHEET_NAMES.THANH_VIEN);
    if (!sheet) throw new Error('Không tìm thấy sheet ThanhVien');

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1) return { success: true, count: 0 };

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => normalizeHeaderKey(h));
    const idColIdx = headers.indexOf('id') !== -1 ? headers.indexOf('id') : 0;
    const toIdColIdx = headers.indexOf('toid');

    if (toIdColIdx === -1) {
      throw new Error('Cấu trúc sheet ThanhVien thiếu cột toId');
    }

    const idValues = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues();
    const toValues = sheet.getRange(2, toIdColIdx + 1, lastRow - 1, 1).getValues();

    let count = 0;
    const memberIdSet = new Set(memberIds.map(String));

    for (let i = 0; i < idValues.length; i++) {
      const rowId = String(idValues[i][0]);
      if (memberIdSet.has(rowId)) {
        toValues[i][0] = toId || '';
        count++;
      }
    }

    if (count > 0) {
      // 1 LẦN BATCH WRITE DUY NHẤT CHO CỘT TỔ NHÓM!
      sheet.getRange(2, toIdColIdx + 1, lastRow - 1, 1).setValues(toValues);
    }

    return {
      success: true,
      message: `Đã gán thành công ${count} ban viên vào tổ!`,
      count: count,
      memberIds: memberIds,
      toId: toId
    };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function apiBulkImportMembers(payload, customSheetId) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch(e) {}
  try {
    const list = payload.members || payload.data || (Array.isArray(payload) ? payload : []);
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('Danh sách nhập vào trống');
    }

    const ss = getSpreadsheet(customSheetId);
    let sheet = ss.getSheetByName(SHEET_NAMES.THANH_VIEN);
    if (!sheet) {
      setupDatabase(customSheetId);
      sheet = ss.getSheetByName(SHEET_NAMES.THANH_VIEN);
    }

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());

    // Map existing members by phone or name to avoid duplication
    let existingData = [];
    if (lastRow > 1) {
      existingData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    }

    const sdtIdx = headers.map(normalizeHeaderKey).indexOf('sdt');
    const hoTenIdx = headers.map(normalizeHeaderKey).indexOf('hoten');
    const existingPhones = new Set();
    const existingNames = new Set();

    existingData.forEach(r => {
      if (sdtIdx !== -1 && r[sdtIdx]) existingPhones.add(String(r[sdtIdx]).trim());
      if (hoTenIdx !== -1 && r[hoTenIdx]) existingNames.add(String(r[hoTenIdx]).trim().toLowerCase());
    });

    const rowsToAppend = [];
    let addedCount = 0;
    let skippedCount = 0;
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

    list.forEach(m => {
      const name = (m.hoTen || '').trim();
      const phone = (m.sdt || '').trim();

      if (!name) {
        skippedCount++;
        return;
      }

      // Check duplicates
      if (phone && existingPhones.has(phone)) {
        skippedCount++;
        return;
      }
      if (!phone && existingNames.has(name.toLowerCase())) {
        skippedCount++;
        return;
      }

      const rec = {
        id: 'id_' + Utilities.getUuid().substring(0, 8),
        maTV: m.maTV || ('TV_' + Utilities.getUuid().substring(0, 5).toUpperCase()),
        hoTen: name,
        sdt: phone,
        ngaySinh: m.ngaySinh || '',
        gioiTinh: m.gioiTinh || 'Nam',
        toId: m.toId || m.to || '',
        chucVu: m.chucVu || 'Ban viên',
        diaChi: m.diaChi || '',
        trangThai: 'active',
        ghiChu: m.ghiChu || '',
        ngayTao: nowStr
      };

      const row = headers.map(h => {
        const norm = normalizeHeaderKey(h);
        if (rec[h] !== undefined) return rec[h];
        if (norm && rec[norm] !== undefined) return rec[norm];
        return '';
      });

      rowsToAppend.push(row);
      if (phone) existingPhones.add(phone);
      existingNames.add(name.toLowerCase());
      addedCount++;
    });

    if (rowsToAppend.length > 0) {
      // 1 LẦN BATCH WRITE DUY NHẤT CHO TOÀN BỘ DANH SÁCH NHẬP
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
    }

    return {
      success: true,
      added: addedCount,
      skipped: skippedCount,
      total: list.length,
      message: `Đã nhập thành công ${addedCount} ban viên mới${skippedCount > 0 ? ` (bỏ qua ${skippedCount} bản ghi trùng/trống)` : ''}!`
    };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

