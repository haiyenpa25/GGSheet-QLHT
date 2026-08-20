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
  [SHEET_NAMES.LICH_QUY]: ['id', 'nam', 'quy', 'tuanThu', 'ngayNhom', 'deTai', 'cauGoc', 'doKT', 'toPhuTrach', 'phuTrach', 'huongDan', 'cauNguyen', 'banHat', 'ghiChu', 'trangThai'],
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
      case 'apiSaveVisitation':
        result = apiSaveVisitation(params.data || params, sheetId);
        break;
      case 'apiDeleteVisitation':
        result = apiDeleteVisitation(params.id, sheetId);
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
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', customId);
  }

  const ss = getSpreadsheet(customId);

  Object.keys(SCHEMAS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      const allSheets = ss.getSheets();
      if (sheetName === SHEET_NAMES.THANH_VIEN && allSheets.length === 1 && (allSheets[0].getName().startsWith('Sheet') || allSheets[0].getName().startsWith('Trang'))) {
        sheet = allSheets[0];
        sheet.setName(sheetName);
      } else {
        sheet = ss.insertSheet(sheetName);
      }
    }

    const headers = SCHEMAS[sheetName];
    if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#10b981')
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  });

  return {
    success: true,
    message: 'Khởi tạo cơ sở dữ liệu Ban Ngành thành công!',
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
    'code': 'maTV',
    'hoten': 'hoTen',
    'hovaten': 'hoTen',
    'fullname': 'hoTen',
    'name': 'hoTen',
    'ten': 'hoTen',
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
    'noidungcaunguyen': 'noiDungCauNguyen'
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
    if (!record.ngayTao) {
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
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) throw new Error('Bảng dữ liệu trống');

    const headers = data[0].map(h => String(h).trim());
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) throw new Error('Không tìm thấy bản ghi ID: ' + id);

    const currentRow = data[rowIndex - 1];
    const newRow = headers.map((h, idx) => {
      const norm = normalizeHeaderKey(h);
      if (updates[h] !== undefined) return updates[h];
      if (updates[norm] !== undefined) return updates[norm];
      return currentRow[idx];
    });

    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);
    return { id, ...updates };
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
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    throw new Error('Không tìm thấy bản ghi để xóa (ID: ' + id + ')');
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

/**
 * Batch-Optimized apiGetInitialData (Reads entire spreadsheet in 1 single API call)
 */
function apiGetInitialData(customSheetId) {
  try {
    const ss = getSpreadsheet(customSheetId);
    const sheets = ss.getSheets();
    const sheetMap = {};

    sheets.forEach(s => {
      sheetMap[s.getName()] = s.getDataRange().getValues();
    });

    // Check if sheets exist; if not, initialize database
    if (!sheetMap[SHEET_NAMES.THANH_VIEN]) {
      setupDatabase(customSheetId);
      const newSheets = ss.getSheets();
      newSheets.forEach(s => {
        sheetMap[s.getName()] = s.getDataRange().getValues();
      });
    }

    const members = parseRowsFromValues(sheetMap[SHEET_NAMES.THANH_VIEN] || []);
    const groups = parseRowsFromValues(sheetMap[SHEET_NAMES.TO_NHOM] || []);
    const funds = parseRowsFromValues(sheetMap[SHEET_NAMES.DANH_MUC_QUY] || []);
    const transactions = parseRowsFromValues(sheetMap[SHEET_NAMES.SO_QUY] || []);
    const attendances = parseRowsFromValues(sheetMap[SHEET_NAMES.DIEM_DANH] || []);
    const visits = parseRowsFromValues(sheetMap[SHEET_NAMES.THAM_VIENG] || []);
    const schedules = parseRowsFromValues(sheetMap[SHEET_NAMES.LICH_QUY] || []);
    const themes = parseRowsFromValues(sheetMap[SHEET_NAMES.CHU_DE] || []);
    const templates = parseRowsFromValues(sheetMap[SHEET_NAMES.MAU_TIN_NHAN] || []);

    let totalBalance = 0;
    funds.forEach(f => {
      totalBalance += Number(f.soDuDauKy || 0);
    });
    transactions.forEach(t => {
      const amount = Number(t.soTien || 0);
      if (t.loaiGD === 'THU') totalBalance += amount;
      if (t.loaiGD === 'CHI') totalBalance -= amount;
    });

    const yearTheme = themes.find(t => String(t.nam) === '2026') || themes[0] || {
      chuDe: 'KỶ LUẬT THUỘC LINH',
      cauGoc: 'I Ti-mô-thê 4:7-8',
      noiDungCauGoc: 'Hãy tập tành sự tin kính; vì sự tập tành thân thể ích lợi ít bề, còn sự tin kính ích cho mọi sự, có lời hứa về đời này và đời sau nữa.'
    };

    return {
      success: true,
      data: {
        kpis: {
          total_members: members.length,
          active_members: members.filter(m => (m.trangThai || 'active') === 'active').length,
          group_count: groups.length,
          total_balance: totalBalance,
          total_attendance_records: attendances.length,
          total_visits: visits.length
        },
        theme: yearTheme,
        members: members,
        groups: groups,
        funds: funds,
        transactions: transactions.slice(-20).reverse(),
        attendances: attendances.slice(-50).reverse(),
        visits: visits.slice(-20).reverse(),
        schedules: schedules,
        themes: themes,
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
    return { success: true, data: res, message: 'Đã lưu lịch sinh hoạt thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiDeleteSchedule(id, customSheetId) {
  try {
    sheetDelete(SHEET_NAMES.LICH_QUY, id, customSheetId);
    return { success: true, message: 'Đã xóa lịch sinh hoạt thành công!' };
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
