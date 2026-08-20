/**
 * HỆ THỐNG QUẢN LÝ BAN NGÀNH (REST API & WEB APP ENGINE)
 * Google Apps Script Backend (Batch-Optimized & Multi-tenant Ready)
 */

const DEFAULT_SPREADSHEET_ID = '';

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
  [SHEET_NAMES.DIEM_DANH]: ['id', 'ngayDiemDanh', 'thanhVienId', 'coMat', 'thuocCauGoc', 'ghiChu', 'nguoiDiemDanh', 'createdAt'],
  [SHEET_NAMES.THAM_VIENG]: ['id', 'ngayTham', 'thanhVienId', 'nguoiTham', 'hinhThuc', 'noiDungCauNguyen', 'ketQua', 'ngayTao'],
  [SHEET_NAMES.LICH_QUY]: ['id', 'nam', 'quy', 'tuanThu', 'ngayNhom', 'deTai', 'cauGoc', 'noiDungCauGoc', 'doKT', 'nguoiDoKT', 'huongDan', 'toPhuTrach', 'phuTrach', 'baiHatTonVinh', 'trangPhuc', 'gioNhom', 'ghiChu', 'trangThai'],
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

  const sheetId = e && e.parameter && e.parameter.sheetId ? e.parameter.sheetId : '';
  const banNganhId = e && e.parameter && e.parameter.banNganhId ? e.parameter.banNganhId : '';
  const title = e && e.parameter && e.parameter.title ? e.parameter.title : '';

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
      case 'apiSeedThanhTrangMembers':
        result = apiSeedThanhTrangMembers(sheetId);
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

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    try {
      return HtmlService.createHtmlOutputFromFile(filename + '.html').getContent();
    } catch (e2) {
      return `<!-- Error including ${filename}: ${e.message} -->`;
    }
  }
}

function getSpreadsheet(customSheetId) {
  const savedId = customSheetId || PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID;
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId.trim());
    } catch (err) {
      Logger.log('Lỗi mở Sheet bằng ID: ' + err.message);
    }
  }
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  throw new Error('Chưa kết nối Google Sheet cho Ban Ngành này. Vui lòng mở từ Master hoặc cấu hình ID Sheet trong Cài Đặt!');
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
    } else {
      // Sheet already exists - check if any columns are missing and append them!
      const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
      const normalizedCurrent = currentHeaders.map(h => normalizeHeaderKey(h));
      
      const missingHeaders = [];
      expectedHeaders.forEach(exp => {
        const normExp = normalizeHeaderKey(exp);
        if (!normalizedCurrent.includes(normExp) && !currentHeaders.includes(exp)) {
          missingHeaders.push(exp);
        }
      });

      if (missingHeaders.length > 0) {
        const startCol = lastCol + 1;
        sheet.getRange(1, startCol, 1, missingHeaders.length).setValues([missingHeaders]);
        sheet.getRange(1, startCol, 1, missingHeaders.length)
          .setFontWeight('bold')
          .setBackground('#10b981')
          .setFontColor('#ffffff');
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

    // Thăm viếng
    'ngaytham': 'ngayTham',
    'nguoitham': 'nguoiTham',
    'noidungcaunguyen': 'noiDungCauNguyen',

    // Lịch sinh hoạt
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
    'tophutrach': 'toPhuTrach',
    'phutrach': 'phuTrach',
    'giangluan': 'phuTrach',
    'huongdan': 'huongDan',
    'hdct': 'huongDan',
    'nguoihd': 'huongDan',
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
  try { lock.waitLock(6000); } catch(e) {}
  try {
    const ss = getSpreadsheet(customSheetId);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      setupDatabase(customSheetId);
      sheet = ss.getSheetByName(sheetName);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
    if (!record.id) {
      record.id = 'id_' + Utilities.getUuid().substring(0, 8);
    }
    if (!record.ngayTao && !record.createdAt) {
      record.ngayTao = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    }

    const row = headers.map(h => {
      const norm = normalizeHeaderKey(h);
      if (record[h] !== undefined) return record[h];
      if (record[norm] !== undefined) return record[norm];
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
  try { lock.waitLock(6000); } catch(e) {}
  try {
    const ss = getSpreadsheet(customSheetId);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Không tìm thấy sheet ${sheetName}`);

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim());

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id) || String(data[i][headers.indexOf('id')]) === String(id)) {
        headers.forEach((h, colIdx) => {
          const norm = normalizeHeaderKey(h);
          if (updates[h] !== undefined) {
            sheet.getRange(i + 1, colIdx + 1).setValue(updates[h]);
          } else if (updates[norm] !== undefined) {
            sheet.getRange(i + 1, colIdx + 1).setValue(updates[norm]);
          }
        });
        return { success: true, id: id };
      }
    }
    throw new Error(`Không tìm thấy bản ghi với ID ${id}`);
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function sheetDelete(sheetName, id, customSheetId) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(6000); } catch(e) {}
  try {
    const ss = getSpreadsheet(customSheetId);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Không tìm thấy sheet ${sheetName}`);

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim());
    const idColIdx = headers.indexOf('id') !== -1 ? headers.indexOf('id') : 0;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idColIdx]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Đã xóa bản ghi' };
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
    // Tự động kiểm tra và chuẩn hóa cấu trúc các tab và cột cho file Sheet này
    setupDatabase(customSheetId);

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

    let members = parseRowsFromValues(sheetMap[SHEET_NAMES.THANH_VIEN] || []);
    let groups = parseRowsFromValues(sheetMap[SHEET_NAMES.TO_NHOM] || []);

    if (members.length === 0 && groups.length === 0) {
      apiSeedThanhTrangMembers(customSheetId);
      const tvSheet = ss.getSheetByName(SHEET_NAMES.THANH_VIEN);
      const toSheet = ss.getSheetByName(SHEET_NAMES.TO_NHOM);
      if (tvSheet && tvSheet.getLastRow() > 1) {
        members = parseRowsFromValues(tvSheet.getRange(1, 1, tvSheet.getLastRow(), tvSheet.getLastColumn()).getValues());
      }
      if (toSheet && toSheet.getLastRow() > 1) {
        groups = parseRowsFromValues(toSheet.getRange(1, 1, toSheet.getLastRow(), toSheet.getLastColumn()).getValues());
      }
    }

    const funds = parseRowsFromValues(sheetMap[SHEET_NAMES.DANH_MUC_QUY] || []);
    const transactions = parseRowsFromValues(sheetMap[SHEET_NAMES.SO_QUY] || []);
    const attendances = parseRowsFromValues(sheetMap[SHEET_NAMES.DIEM_DANH] || []);
    const visits = parseRowsFromValues(sheetMap[SHEET_NAMES.THAM_VIENG] || []);
    const schedules = parseRowsFromValues(sheetMap[SHEET_NAMES.LICH_QUY] || []);
    const themes = parseRowsFromValues(sheetMap[SHEET_NAMES.CHU_DE] || []);
    const templates = parseRowsFromValues(sheetMap[SHEET_NAMES.MAU_TIN_NHAN] || []);

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
    return { success: true, message: 'Đã xóa ban viên thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiBulkImportMembers(payload, customSheetId) {
  try {
    setupDatabase(customSheetId);

    // 1. Đảm bảo tồn tại 2 tổ: Tổ Đa-ni-ên & Tổ Phao-lô
    let groups = sheetFindAll(SHEET_NAMES.TO_NHOM, customSheetId);
    let toDanien = groups.find(g => normalizeHeaderKey(g.tenTo).includes('danien') || normalizeHeaderKey(g.maTo).includes('danien'));
    let toPhaolo = groups.find(g => normalizeHeaderKey(g.tenTo).includes('phaolo') || normalizeHeaderKey(g.maTo).includes('phaolo'));

    if (!toDanien) {
      toDanien = sheetInsert(SHEET_NAMES.TO_NHOM, {
        maTo: 'TO_DANIEN',
        tenTo: 'Tổ Đa-ni-ên',
        toTruong: '',
        toPho: '',
        ghiChu: 'Tổ sinh hoạt Đa-ni-ên'
      }, customSheetId);
    }
    if (!toPhaolo) {
      toPhaolo = sheetInsert(SHEET_NAMES.TO_NHOM, {
        maTo: 'TO_PHAOLO',
        tenTo: 'Tổ Phao-lô',
        toTruong: '',
        toPho: '',
        ghiChu: 'Tổ sinh hoạt Phao-lô'
      }, customSheetId);
    }

    const membersList = payload.members || payload.list || [];
    if (!Array.isArray(membersList) || membersList.length === 0) {
      throw new Error('Danh sách ban viên nhập vào trống');
    }

    let count = 0;
    const existingMembers = sheetFindAll(SHEET_NAMES.THANH_VIEN, customSheetId);

    membersList.forEach((m, idx) => {
      const hoTen = (m.hoTen || m.HoTen || m['HỌ VÀ TÊN'] || m.name || '').trim();
      if (!hoTen) return;

      let toId = m.toId || '';
      const toName = (m.to || m.toName || m.tenTo || '').trim().toLowerCase();
      if (toName.includes('phao') || toName.includes('phaolo')) {
        toId = toPhaolo.id;
      } else if (toName.includes('da') || toName.includes('danien')) {
        toId = toDanien.id;
      } else if (!toId) {
        toId = toDanien.id;
      }

      const exist = existingMembers.find(em => em.hoTen && em.hoTen.toLowerCase().trim() === hoTen.toLowerCase());
      const memberObj = {
        maTV: m.maTV || ('BV' + String(idx + 1).padStart(3, '0')),
        hoTen: hoTen,
        sdt: m.sdt || m.SDT || m.phone || '',
        ngaySinh: m.ngaySinh || m['NGÀY SINH'] || m.dob || '',
        gioiTinh: m.gioiTinh || m.gender || 'Nam',
        toId: toId,
        chucVu: m.chucVu || m.role || 'Ban viên',
        diaChi: m.diaChi || m['ĐỊA CHỈ'] || m.address || '',
        trangThai: m.trangThai || 'active',
        ghiChu: m.ghiChu || ''
      };

      if (exist && exist.id) {
        sheetUpdate(SHEET_NAMES.THANH_VIEN, exist.id, memberObj, customSheetId);
      } else {
        sheetInsert(SHEET_NAMES.THANH_VIEN, memberObj, customSheetId);
      }
      count++;
    });

    return {
      success: true,
      message: `Đã nạp thành công ${count} ban viên vào cơ sở dữ liệu!`,
      count: count
    };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSeedThanhTrangMembers(customSheetId) {
  const list55 = [
    { stt: 1, hoTen: "Ksor H' Miram", ngaySinh: "12/04/2000", diaChi: "", sdt: "", to: "Phao-lô" },
    { stt: 2, hoTen: "Rmah Toàn", ngaySinh: "15/10/1999", diaChi: "", sdt: "", to: "Đa-ni-ên" },
    { stt: 3, hoTen: "Trần Thị Thanh Thảo", ngaySinh: "01/06/1995", diaChi: "", sdt: "0971520748", to: "Đa-ni-ên" },
    { stt: 4, hoTen: "Nguyễn Thế Hải", ngaySinh: "05/03/1993", diaChi: "407/5, Nguyễn Thị Định, Cát Lái, Tp. Thủ Đức", sdt: "0934987202", to: "Đa-ni-ên" },
    { stt: 5, hoTen: "Lê Thị Hoàng Yến", ngaySinh: "28/05/1993", diaChi: "407/5, Nguyễn Thị Định, Cát Lái, Tp. Thủ Đức", sdt: "0877115836", to: "Phao-lô" },
    { stt: 6, hoTen: "Nguyễn Quốc Khánh", ngaySinh: "26/01/1993", diaChi: "", sdt: "0773777910", to: "Đa-ni-ên" },
    { stt: 7, hoTen: "La Minh Hoàng", ngaySinh: "29/11/1992", diaChi: "20, Đường 38, Bình Trưng Tây, Tp. Thủ Đức", sdt: "0934078190", to: "Đa-ni-ên" },
    { stt: 8, hoTen: "Nguyễn Đặng Thảo Nguyên", ngaySinh: "17/04/1992", diaChi: "", sdt: "0935092920", to: "Đa-ni-ên" },
    { stt: 9, hoTen: "Phạm Kiều Trâm", ngaySinh: "18/05/1992", diaChi: "", sdt: "0906860489", to: "Đa-ni-ên" },
    { stt: 10, hoTen: "Cao Thiên Ngọc", ngaySinh: "04/04/1992", diaChi: "", sdt: "0932166032", to: "Đa-ni-ên" },
    { stt: 11, hoTen: "Y Đuen Êban", ngaySinh: "13/10/1991", diaChi: "154, Đường 67, Cát Lái, Tp. Thủ Đức", sdt: "0903093041", to: "Đa-ni-ên" },
    { stt: 12, hoTen: "Nguyễn Ngọc Hà Thi", ngaySinh: "19/05/1991", diaChi: "154, Đường 67, Cát Lái, Tp. Thủ Đức", sdt: "0902659747", to: "Phao-lô" },
    { stt: 13, hoTen: "Tăng Khắc Thiên Nhân", ngaySinh: "14/12/1991", diaChi: "", sdt: "0963577778", to: "Phao-lô" },
    { stt: 14, hoTen: "Nhật Thuy", ngaySinh: "21/07/1991", diaChi: "", sdt: "0939926929", to: "Đa-ni-ên" },
    { stt: 15, hoTen: "Nguyễn Thị Trà My", ngaySinh: "05/03/1990", diaChi: "42, Thạnh Mỹ Lợi, Thạnh Mỹ Lợi, Tp. Thủ Đức", sdt: "0978550426", to: "Đa-ni-ên" },
    { stt: 16, hoTen: "Phạm Anh Tuấn", ngaySinh: "12/09/1990", diaChi: "42, Thạnh Mỹ Lợi, Thạnh Mỹ Lợi, Tp. Thủ Đức", sdt: "0399182821", to: "Phao-lô" },
    { stt: 17, hoTen: "Nguyễn Ngọc Tuệ", ngaySinh: "07/11/1990", diaChi: "", sdt: "0905251525", to: "Đa-ni-ên" },
    { stt: 18, hoTen: "Huỳnh Giang Duy Vũ", ngaySinh: "18/02/1990", diaChi: "", sdt: "", to: "Phao-lô" },
    { stt: 19, hoTen: "Lê Kim Huệ", ngaySinh: "07/05/1989", diaChi: "20, Đường 38, Bình Trưng Tây, Tp. Thủ Đức", sdt: "0978436182", to: "Đa-ni-ên" },
    { stt: 20, hoTen: "Nguyễn Thị Nhung", ngaySinh: "29/02/1988", diaChi: "42, Đường 28, Cát Lái, Tp. Thủ Đức", sdt: "0928220493", to: "Đa-ni-ên" },
    { stt: 21, hoTen: "Trịnh Thế Hân", ngaySinh: "18/12/1988", diaChi: "13, Vành đai tây, An Khánh, Tp. Thủ Đức", sdt: "0919499857", to: "Đa-ni-ên" },
    { stt: 22, hoTen: "Nguyễn Kim Long", ngaySinh: "05/09/1988", diaChi: "", sdt: "0905673400", to: "Đa-ni-ên" },
    { stt: 23, hoTen: "Nguyễn Văn Hưng", ngaySinh: "03/01/1987", diaChi: "194, Hồ Văn Huê, Phường 9, Quận Phú Nhuận", sdt: "0972400688", to: "Đa-ni-ên" },
    { stt: 24, hoTen: "Nguyễn Thanh Tuấn", ngaySinh: "25/04/1987", diaChi: "42, Đường 28, Cát Lái, Tp. Thủ Đức", sdt: "0376258520", to: "Phao-lô" },
    { stt: 25, hoTen: "Hoàng Thị Giang", ngaySinh: "06/10/1987", diaChi: "Hommyland 3, Tp. Thủ Đức", sdt: "0917555085", to: "Đa-ni-ên" },
    { stt: 26, hoTen: "Nguyễn Thị Nhật Thiên", ngaySinh: "09/11/1987", diaChi: "", sdt: "0902680274", to: "Đa-ni-ên" },
    { stt: 27, hoTen: "Trương Thị Thanh Thảo", ngaySinh: "26/04/1986", diaChi: "649/2, Nguyễn Thị Định, Cát Lái, Tp. Thủ Đức", sdt: "0901094521", to: "Đa-ni-ên" },
    { stt: 28, hoTen: "Nguyễn Thị Thu Hiền", ngaySinh: "10/08/1986", diaChi: "603, Nguyễn Thị Định, Cát Lái, Tp. Thủ Đức", sdt: "0933833967", to: "Phao-lô" },
    { stt: 29, hoTen: "Vũ Kiều Oanh", ngaySinh: "17/07/1986", diaChi: "194, Hồ Văn Huê, Phường 9, Quận Phú Nhuận", sdt: "0904067880", to: "Đa-ni-ên" },
    { stt: 30, hoTen: "Huỳnh Nhuận Tâm", ngaySinh: "07/11/1986", diaChi: "301 Lô A1, CC Thạnh Mỹ Lợi F, Thạnh Mỹ Lợi, Tp. Thủ Đức", sdt: "0906488319", to: "Đa-ni-ên" },
    { stt: 31, hoTen: "Nguyễn Ngọc Tuân", ngaySinh: "13/06/1986", diaChi: "", sdt: "0905058053", to: "Đa-ni-ên" },
    { stt: 32, hoTen: "Lê Quang Trung Tín", ngaySinh: "21/02/1985", diaChi: "Hommyland 3, Tp. Thủ Đức", sdt: "0919762274", to: "Phao-lô" },
    { stt: 33, hoTen: "Châu Thị Mai", ngaySinh: "04/12/1985", diaChi: "", sdt: "", to: "Đa-ni-ên" },
    { stt: 34, hoTen: "Nguyễn Thị Mỹ Ngọc", ngaySinh: "13/11/1984", diaChi: "45/9, Đường 32, Thạnh Mỹ Lợi, Tp. Thủ Đức", sdt: "0938603284", to: "Đa-ni-ên" },
    { stt: 35, hoTen: "Lê Khắc Đại Lộc", ngaySinh: "23/05/1984", diaChi: "30/5, Thạnh Mỹ Lợi, Thạnh Mỹ Lợi, Tp. Thủ Đức", sdt: "0947998847", to: "Đa-ni-ên" },
    { stt: 36, hoTen: "Tô Bích Trâm", ngaySinh: "24/07/1984", diaChi: "", sdt: "", to: "Đa-ni-ên" },
    { stt: 37, hoTen: "Thái Nhựt Bình", ngaySinh: "06/03/1983", diaChi: "31, Đường 18, Bình Trưng Tây, Tp. Thủ Đức", sdt: "0976181237", to: "Đa-ni-ên" },
    { stt: 38, hoTen: "Bùi Thị Thu Hiền", ngaySinh: "07/02/1983", diaChi: "31, Đường 18, Bình Trưng Tây, Tp. Thủ Đức", sdt: "0362688466", to: "Phao-lô" },
    { stt: 39, hoTen: "Huỳnh Nhật Kha My", ngaySinh: "17/03/1982", diaChi: "Ấp Cát, Xã Phú Hữu, Nhơn Trạch", sdt: "0908988913", to: "Đa-ni-ên" },
    { stt: 40, hoTen: "Hồ Thị Minh Nhựt", ngaySinh: "01/10/1982", diaChi: "", sdt: "0705705474", to: "Đa-ni-ên" },
    { stt: 41, hoTen: "Hồ Thị Diễm Ngọc", ngaySinh: "19/12/1981", diaChi: "", sdt: "0972682035", to: "Đa-ni-ên" },
    { stt: 42, hoTen: "Nguyễn Nguyên Bá", ngaySinh: "27/10/1980", diaChi: "CC HomyLand 2, Bình Trưng Tây, Tp. Thủ Đức", sdt: "0903101754", to: "Đa-ni-ên" },
    { stt: 43, hoTen: "Phan Văn Hoàng", ngaySinh: "01/01/1978", diaChi: "", sdt: "", to: "Đa-ni-ên" },
    { stt: 44, hoTen: "Nguyễn Hoa Thiên Lý", ngaySinh: "17/03/1978", diaChi: "54A, Trần Văn Giáp, Hiệp Tân, Tân Phú", sdt: "0902888001", to: "Đa-ni-ên" },
    { stt: 45, hoTen: "Lưu Văn Minh", ngaySinh: "18/05/1978", diaChi: "40/2, Đường 836, Phú Hữu, Tp. Thủ Đức", sdt: "0398687567", to: "Đa-ni-ên" },
    { stt: 46, hoTen: "Nguyễn Yến Thanh", ngaySinh: "27/08/1978", diaChi: "", sdt: "0827708278", to: "Đa-ni-ên" },
    { stt: 47, hoTen: "Huỳnh Tấn Trực", ngaySinh: "16/11/1978", diaChi: "", sdt: "", to: "Đa-ni-ên" },
    { stt: 48, hoTen: "Đặng Xuân Hương", ngaySinh: "30/11/1977", diaChi: "Căn 202 - Lô B2, CC Thạnh Mỹ Lợi, Tp. Thủ Đức", sdt: "0908475364", to: "Đa-ni-ên" },
    { stt: 49, hoTen: "Quách Thanh Dũng", ngaySinh: "24/12/1977", diaChi: "126, Lê Văn Thịnh, Bình Trưng Tây, Tp. Thủ Đức", sdt: "0935913441", to: "Đa-ni-ên" },
    { stt: 50, hoTen: "Trần Thị Sen", ngaySinh: "10/09/1977", diaChi: "126, Lê Văn Thịnh, Bình Trưng Tây, Tp. Thủ Đức", sdt: "0965430060", to: "Phao-lô" },
    { stt: 51, hoTen: "Nguyễn Thị Hồng Việt", ngaySinh: "17/01/1976", diaChi: "CC HomyLand 2, Bình Trưng Tây, Tp. Thủ Đức", sdt: "0908868909", to: "Đa-ni-ên" },
    { stt: 52, hoTen: "Huỳnh Thị Ngọc Lâm", ngaySinh: "02/10/1975", diaChi: "84/5, Bình Trưng, Bình Trưng Đông, Tp. Thủ Đức", sdt: "0898275113", to: "Phao-lô" },
    { stt: 53, hoTen: "Nguyễn Sơn Đông", ngaySinh: "23/10/1971", diaChi: "54A, Trần Văn Giáp, Hiệp Tân, Tân Phú", sdt: "0903305029", to: "Đa-ni-ên" },
    { stt: 54, hoTen: "Nguyễn Thị Ngọc Mỹ", ngaySinh: "20/02/1971", diaChi: "898/7, Nguyễn Thị Định, Thạnh Mỹ Lợi, Tp. Thủ Đức", sdt: "0905297004", to: "Phao-lô" },
    { stt: 55, hoTen: "Nguyễn Thị Hạ Thương", ngaySinh: "", diaChi: "", sdt: "", to: "Đa-ni-ên" }
  ];

  return apiBulkImportMembers({ members: list55 }, customSheetId);
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
    return { success: true, message: 'Đã xóa tổ nhóm thành công!' };
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

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
      const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
      
      const newRows = payload.records.map(rec => {
        const record = {
          id: 'id_' + Utilities.getUuid().substring(0, 8),
          ngayDiemDanh: payload.ngayDiemDanh,
          thanhVienId: rec.thanhVienId,
          coMat: rec.coMat ? 'CO_MAT' : 'VANG',
          thuocCauGoc: rec.thuocCauGoc ? 'THUOC' : 'CHUA_THUOC',
          ghiChu: rec.ghiChu || '',
          nguoiDiemDanh: payload.nguoiDiemDanh || 'Thư Ký',
          createdAt: nowStr
        };
        return headers.map(h => {
          const norm = normalizeHeaderKey(h);
          if (record[h] !== undefined) return record[h];
          if (record[norm] !== undefined) return record[norm];
          return '';
        });
      });

      if (newRows.length > 0) {
        const lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1, 1, newRows.length, headers.length).setValues(newRows);
      }

      return { success: true, message: `Đã lưu điểm danh cho ${payload.records.length} ban viên thành công!` };
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
    return { success: true, message: 'Đã xóa phiếu thăm viếng thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSyncDatabaseSchema(customSheetId) {
  return setupDatabase(customSheetId);
}
