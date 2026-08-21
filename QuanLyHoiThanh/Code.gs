/**
 * HỆ THỐNG QUẢN LÝ HỘI THÁNH & BAN NGÀNH (MASTER API & WEB APP)
 * Google Apps Script Backend (Hỗ trợ cả Web App trực tiếp & REST API cho GitHub Pages)
 */

// =========================================================================
// 1. CẤU HÌNH & KHỞI TẠO MẶC ĐỊNH
// =========================================================================

const DEFAULT_SPREADSHEET_ID = '124O4hYFaxmZm1hg8FyRP4fci6hw84ziIg8o3eAUwMV0';
const DEFAULT_DRIVE_FOLDER_ID = '1dy78gH_lwfvPUKaZMRCsiOwN2ZPWcBGj';
const DEFAULT_BAN_NGANH_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyTzZ_cRWo7DUaIb65Y7ihwRYuu7KY5OMvaFfZqQRTvYt1Mjv8LZebFzPbqEkF3jglI/exec';

const SHEET_NAMES = {
  HOI_THANH: 'HoiThanh',
  BAN_NGANH: 'BanNganh',
  BAN_NGANH_STATS: 'BanNganhStats',
  CAU_HINH: 'CauHinh'
};

const SCHEMAS = {
  [SHEET_NAMES.HOI_THANH]: [
    'id', 'maHT', 'tenHT', 'mucSu', 'diaChi', 'quanHuyen', 'tinhThanh',
    'sdt', 'email', 'ngayThanhLap', 'trangThai', 'driveFolderId', 'ghiChu', 'ngayTao'
  ],
  [SHEET_NAMES.BAN_NGANH]: [
    'id', 'hoiThanhId', 'maBN', 'tenBN', 'loaiBN', 'truongBan', 'thuky',
    'sdtLienHe', 'spreadsheetId', 'spreadsheetUrl', 'webAppUrl', 'trangThai', 'ghiChu', 'ngayTao'
  ],
  [SHEET_NAMES.BAN_NGANH_STATS]: [
    'ministryId', 'churchId', 'totalMembers', 'activeMembers', 'attendanceRate4Weeks',
    'absentWarnings', 'activeCareCases', 'monthIncome', 'monthExpense', 'balance',
    'upcomingBirthdays', 'lastUpdatedAt'
  ],
  [SHEET_NAMES.CAU_HINH]: [
    'key', 'value', 'moTa', 'ngayCapNhat'
  ]
};

// =========================================================================
// 2. ENTRY POINTS: doGet & doPost (HỖ TRỢ CẢ WEB APP LẪN REST API CHO GITHUB)
// =========================================================================

function doGet(e) {
  // Nếu có tham số action -> Trả về REST API JSON cho GitHub Pages
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }

  // Mặc định trả về Web App HTML trực tiếp trên Google Apps Script
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Quản Lý Hội Thánh & Ban Ngành')
    .setFaviconUrl('https://img.icons8.com/fluency/48/church.png')
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

    switch (action) {
      case 'apiGetInitialData':
        result = apiGetInitialData();
        break;
      case 'apiSaveChurch':
        result = apiSaveChurch(params.data || params);
        break;
      case 'apiDeleteChurch':
        result = apiDeleteChurch(params.id);
        break;
      case 'apiSaveMinistry':
        result = apiSaveMinistry(params.data || params);
        break;
      case 'apiDeleteMinistry':
        result = apiDeleteMinistry(params.id);
        break;
      case 'apiCreateMinistrySheet':
        result = apiCreateMinistrySheet(params.banNganhId || params.id, params.customTitle);
        break;
      case 'apiLinkMinistrySheet':
        result = apiLinkMinistrySheet(params.banNganhId || params.id, params.rawInput || params.sheetId, params.webAppUrl);
        break;
      case 'apiSaveSettings':
        result = apiSaveSettings(params.driveFolder, params.masterSheet, params.banNganhWebAppUrl);
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

// =========================================================================
// 3. KẾT NỐI GOOGLE SPREADSHEET & GOOGLE DRIVE
// =========================================================================

function getSpreadsheet() {
  const savedId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID;
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId.trim());
    } catch (err) {
      Logger.log('Không thể mở Sheet qua ID: ' + err.message);
    }
  }
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  throw new Error('Không thể kết nối tới Google Sheet Master (ID: ' + savedId + '). Vui lòng kiểm tra quyền truy cập!');
}

function getDriveFolder() {
  const savedFolderId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || DEFAULT_DRIVE_FOLDER_ID;
  if (savedFolderId) {
    try {
      return DriveApp.getFolderById(savedFolderId.trim());
    } catch (err) {
      Logger.log('Không thể mở Drive Folder qua ID: ' + err.message);
    }
  }
  try {
    return DriveApp.getRootFolder();
  } catch (e) {
    Logger.log('Không thể lấy Root Folder: ' + e.message);
    return null;
  }
}

function getBanNganhBaseWebAppUrl() {
  return PropertiesService.getScriptProperties().getProperty('BAN_NGANH_WEBAPP_URL') || DEFAULT_BAN_NGANH_WEBAPP_URL;
}

function cleanIdFromInput(input) {
  if (!input) return '';
  let str = String(input).trim();
  const matchSheet = str.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (matchSheet && matchSheet[1]) return matchSheet[1];
  const matchFolder = str.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  if (matchFolder && matchFolder[1]) return matchFolder[1];
  return str;
}

// =========================================================================
// 4. THIẾT LẬP CƠ SỞ DỮ LIỆU TỰ ĐỘNG (SETUP DATABASE)
// =========================================================================

function setupDatabase(sheetIdOrUrl, folderIdOrUrl, banNganhWebAppUrl) {
  if (sheetIdOrUrl) {
    const cleanSheetId = cleanIdFromInput(sheetIdOrUrl);
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', cleanSheetId);
  }
  if (folderIdOrUrl) {
    const cleanFolderId = cleanIdFromInput(folderIdOrUrl);
    PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', cleanFolderId);
  }
  
  const webUrl = banNganhWebAppUrl ? banNganhWebAppUrl.trim() : DEFAULT_BAN_NGANH_WEBAPP_URL;
  PropertiesService.getScriptProperties().setProperty('BAN_NGANH_WEBAPP_URL', webUrl);

  const ss = getSpreadsheet();
  const folder = getDriveFolder();

  // Khởi tạo các Sheet
  Object.keys(SCHEMAS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      const allSheets = ss.getSheets();
      if (sheetName === SHEET_NAMES.HOI_THANH && allSheets.length === 1 && (allSheets[0].getName().startsWith('Sheet') || allSheets[0].getName().startsWith('Trang'))) {
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
        .setBackground('#1a2942')
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  });

  return {
    success: true,
    message: 'Khởi tạo hệ thống Master thành công!',
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    folderName: folder ? folder.getName() : 'Google Drive'
  };
}

// =========================================================================
// 5. GENERIC SHEET CRUD HELPERS
// =========================================================================

function sheetFindAll(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(sheetName);
  }
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

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
    });
    results.push(item);
  }
  return results;
}

function sheetInsert(sheetName, record) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(6000); } catch(e) {}
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName(sheetName);
    }
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());

    if (!record.id) {
      record.id = 'id_' + Utilities.getUuid().substring(0, 8);
    }
    if (!record.ngayTao) {
      record.ngayTao = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    }

    const row = headers.map(h => record[h] !== undefined ? record[h] : '');
    sheet.appendRow(row);
    return record;
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function sheetUpdate(sheetName, id, updates) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch(e) {}
  try {
    const ss = getSpreadsheet();
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
    const updatedObj = {};
    const newRow = headers.map((h, idx) => {
      let val = currentRow[idx];
      if (updates[h] !== undefined) val = updates[h];
      updatedObj[h] = val;
      return val;
    });

    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);
    return { ...updatedObj, id };
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

function sheetDelete(sheetName, id) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch(e) {}
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true, id: id };
      }
    }
    throw new Error('Không tìm thấy bản ghi để xóa (ID: ' + id + ')');
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

// =========================================================================
// 6. BACKEND APIS CHO FRONTEND & GITHUB PAGES
// =========================================================================

function apiGetInitialData() {
  try {
    const ss = getSpreadsheet();
    const folder = getDriveFolder();
    const baseBanNganhUrl = getBanNganhBaseWebAppUrl();

    const churches = sheetFindAll(SHEET_NAMES.HOI_THANH);
    const ministries = sheetFindAll(SHEET_NAMES.BAN_NGANH);

    const ministryCountByChurch = new Map();
    ministries.forEach(m => {
      const k = String(m.hoiThanhId);
      ministryCountByChurch.set(k, (ministryCountByChurch.get(k) || 0) + 1);
    });

    const churchMap = {};
    churches.forEach(c => {
      churchMap[c.id] = c.tenHT;
      c.soLuongBanNganh = ministryCountByChurch.get(String(c.id)) || 0;
    });

    ministries.forEach(m => {
      m.tenHoiThanh = churchMap[m.hoiThanhId] || 'Chưa xác định';
      if (m.spreadsheetId && (!m.webAppUrl || m.webAppUrl.indexOf('sheetId') === -1)) {
        m.webAppUrl = `${baseBanNganhUrl}?sheetId=${encodeURIComponent(m.spreadsheetId)}&banNganhId=${encodeURIComponent(m.id)}&title=${encodeURIComponent(m.tenBN)}`;
      }
    });

    const connectedCount = ministries.filter(m => !!m.spreadsheetId).length;

    return {
      success: true,
      data: {
        kpis: {
          total_churches: churches.length,
          total_ministries: ministries.length,
          connected_sheets: connectedCount,
          pending_sheets: ministries.length - connectedCount
        },
        churches: churches,
        ministries: ministries,
        driveFolder: {
          id: folder ? folder.getId() : '',
          name: folder ? folder.getName() : 'Google Drive',
          url: folder ? folder.getUrl() : ''
        },
        masterSpreadsheet: {
          id: ss.getId(),
          name: ss.getName(),
          url: ss.getUrl()
        },
        banNganhWebAppUrl: baseBanNganhUrl
      }
    };
  } catch (err) {
    Logger.log('apiGetInitialData Error: ' + err.message);
    return { success: false, message: err.message || String(err) };
  }
}

function apiSaveChurch(payload) {
  try {
    if (!payload.tenHT) throw new Error('Tên Hội Thánh không được để trống');

    payload.trangThai = payload.trangThai || 'active';
    payload.maHT = payload.maHT || ('HT_' + Utilities.getUuid().substring(0, 5).toUpperCase());

    if (!payload.driveFolderId) {
      try {
        const rootFolder = getDriveFolder();
        const folderName = `Hội Thánh - ${payload.tenHT}`;
        const existing = rootFolder.getFoldersByName(folderName);
        if (existing.hasNext()) {
          payload.driveFolderId = existing.next().getId();
        } else {
          const newFolder = rootFolder.createFolder(folderName);
          payload.driveFolderId = newFolder.getId();
        }
      } catch (e) {
        Logger.log('Không thể tạo thư mục Drive cho Hội Thánh: ' + e.message);
      }
    }

    let result;
    if (payload.id) {
      result = sheetUpdate(SHEET_NAMES.HOI_THANH, payload.id, payload);
    } else {
      result = sheetInsert(SHEET_NAMES.HOI_THANH, payload);
    }

    return { success: true, data: result, message: 'Đã lưu Hội Thánh thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiDeleteChurch(id) {
  try {
    const ministries = sheetFindAll(SHEET_NAMES.BAN_NGANH).filter(m => String(m.hoiThanhId) === String(id));
    if (ministries.length > 0) {
      throw new Error(`Không thể xóa Hội Thánh này vì đang có ${ministries.length} ban ngành trực thuộc.`);
    }
    sheetDelete(SHEET_NAMES.HOI_THANH, id);
    return { success: true, message: 'Đã xóa Hội Thánh thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSaveMinistry(payload) {
  try {
    if (!payload.tenBN) throw new Error('Tên Ban Ngành không được để trống');
    if (!payload.hoiThanhId) throw new Error('Vui lòng chọn Hội Thánh trực thuộc');

    payload.trangThai = payload.trangThai || 'active';
    payload.maBN = payload.maBN || ('BN_' + Utilities.getUuid().substring(0, 5).toUpperCase());

    const baseWebAppUrl = getBanNganhBaseWebAppUrl();
    if (payload.spreadsheetId && (!payload.webAppUrl || payload.webAppUrl.indexOf('sheetId') === -1)) {
      payload.webAppUrl = `${baseWebAppUrl}?sheetId=${encodeURIComponent(payload.spreadsheetId)}&banNganhId=${encodeURIComponent(payload.id || payload.maBN)}&title=${encodeURIComponent(payload.tenBN)}`;
    }

    let result;
    if (payload.id) {
      result = sheetUpdate(SHEET_NAMES.BAN_NGANH, payload.id, payload);
    } else {
      result = sheetInsert(SHEET_NAMES.BAN_NGANH, payload);
    }

    return { success: true, data: result, message: 'Đã lưu Ban Ngành thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiDeleteMinistry(id) {
  try {
    sheetDelete(SHEET_NAMES.BAN_NGANH, id);
    return { success: true, message: 'Đã xóa Ban Ngành thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiCreateMinistrySheet(banNganhId, customTitle) {
  try {
    const ministries = sheetFindAll(SHEET_NAMES.BAN_NGANH);
    const targetMin = ministries.find(m => String(m.id) === String(banNganhId));
    if (!targetMin) throw new Error('Không tìm thấy ban ngành ID: ' + banNganhId);

    const churches = sheetFindAll(SHEET_NAMES.HOI_THANH);
    const church = churches.find(c => String(c.id) === String(targetMin.hoiThanhId));

    let targetFolder = getDriveFolder();
    if (church && church.driveFolderId) {
      try {
        targetFolder = DriveApp.getFolderById(church.driveFolderId);
      } catch (e) {}
    } else if (church) {
      try {
        const churchFolderName = `Hội Thánh - ${church.tenHT}`;
        const existing = targetFolder.getFoldersByName(churchFolderName);
        if (existing.hasNext()) {
          targetFolder = existing.next();
        } else {
          targetFolder = targetFolder.createFolder(churchFolderName);
          sheetUpdate(SHEET_NAMES.HOI_THANH, church.id, { driveFolderId: targetFolder.getId() });
        }
      } catch (e) {}
    }

    const title = customTitle || `DB_${targetMin.tenBN}_${(church ? church.maHT : 'HT')}`;
    const newSs = SpreadsheetApp.create(title);
    const newId = newSs.getId();
    const newUrl = newSs.getUrl();

    const file = DriveApp.getFileById(newId);
    file.moveTo(targetFolder);

    const defaultTabs = {
      'ThanhVien': ['id', 'maTV', 'hoTen', 'sdt', 'ngaySinh', 'gioiTinh', 'toId', 'chucVu', 'diaChi', 'trangThai', 'ghiChu', 'ngayTao'],
      'ToNhom': ['id', 'maTo', 'tenTo', 'toTruong', 'toPho', 'soLuongThanhVien', 'lichSinhHoat', 'diaDiem', 'ghiChu'],
      'DiemDanh': ['id', 'ngayDiemDanh', 'thanhVienId', 'coMat', 'thuocCauGoc', 'soCauKT', 'ghiChu', 'nguoiDiemDanh', 'createdAt'],
      'ThamVieng': ['id', 'ngayTham', 'thanhVienId', 'nguoiTham', 'hinhThuc', 'noiDungCauNguyen', 'trangThai', 'mucDoUuTien', 'hanChot', 'ketQua', 'ngayTao'],
      'LichQuy': ['id', 'nam', 'quy', 'tuanThu', 'ngayNhom', 'deTai', 'cauGoc', 'noiDungCauGoc', 'dienGia', 'huongDan', 'nguoiDoKT', 'amNhac', 'mayChieu', 'tiepTan', 'toPhuTrach', 'phuTrach', 'baiHatTonVinh', 'trangPhuc', 'gioNhom', 'ghiChu', 'trangThai'],
      'ChuDe': ['id', 'nam', 'quy', 'stt', 'chuDe', 'cauGoc', 'noiDungCauGoc', 'baiHatChuDe', 'mucTieu', 'khauHieu', 'trangThai'],
      'CauHinh': ['key', 'value', 'description', 'updatedAt'],
      'DanhMucQuy': ['id', 'maQuy', 'tenQuy', 'soDuDauKy', 'moTa', 'trangThai', 'ngayTao'],
      'SoQuy': ['id', 'ngayGD', 'maQuy', 'loaiGD', 'hangMuc', 'soTien', 'nguoiNopNhan', 'nguoiThucHien', 'chungTu', 'ghiChu', 'ngayTao'],
      'MauTinNhan': ['id', 'maMau', 'tieuDe', 'loai', 'noiDung', 'moTa', 'trangThai']
    };

    Object.keys(defaultTabs).forEach((tabName, idx) => {
      let s;
      if (idx === 0) {
        s = newSs.getSheets()[0];
        s.setName(tabName);
      } else {
        s = newSs.insertSheet(tabName);
      }
      const cols = defaultTabs[tabName];
      s.getRange(1, 1, 1, cols.length).setValues([cols]);
      s.getRange(1, 1, 1, cols.length).setBackground('#10b981').setFontColor('#ffffff').setFontWeight('bold');
      s.setFrozenRows(1);
    });

    const baseWebAppUrl = getBanNganhBaseWebAppUrl();
    const dynamicWebAppUrl = `${baseWebAppUrl}?sheetId=${encodeURIComponent(newId)}&banNganhId=${encodeURIComponent(banNganhId)}&title=${encodeURIComponent(targetMin.tenBN)}`;

    sheetUpdate(SHEET_NAMES.BAN_NGANH, banNganhId, {
      spreadsheetId: newId,
      spreadsheetUrl: newUrl,
      webAppUrl: dynamicWebAppUrl
    });

    return {
      success: true,
      data: {
        id: newId,
        url: newUrl,
        name: title,
        folderName: targetFolder.getName(),
        webAppUrl: dynamicWebAppUrl
      },
      message: `Tạo Google Sheet mới thành công trong thư mục "${targetFolder.getName()}"!`
    };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiLinkMinistrySheet(banNganhId, rawInput, webAppUrlInput) {
  try {
    const cleanId = cleanIdFromInput(rawInput);
    if (!cleanId) throw new Error('ID hoặc link Sheet không hợp lệ');

    const ss = SpreadsheetApp.openById(cleanId);
    const url = ss.getUrl();

    const ministries = sheetFindAll(SHEET_NAMES.BAN_NGANH);
    const targetMin = ministries.find(m => String(m.id) === String(banNganhId));

    const baseWebAppUrl = getBanNganhBaseWebAppUrl();
    let dynamicWebAppUrl = webAppUrlInput || '';
    if (!dynamicWebAppUrl && baseWebAppUrl && targetMin) {
      dynamicWebAppUrl = `${baseWebAppUrl}?sheetId=${encodeURIComponent(cleanId)}&banNganhId=${encodeURIComponent(banNganhId)}&title=${encodeURIComponent(targetMin.tenBN)}`;
    }

    const updates = {
      spreadsheetId: cleanId,
      spreadsheetUrl: url,
      webAppUrl: dynamicWebAppUrl
    };

    sheetUpdate(SHEET_NAMES.BAN_NGANH, banNganhId, updates);

    return {
      success: true,
      data: { id: cleanId, url: url, name: ss.getName(), ...updates },
      message: `Gán Google Sheet "${ss.getName()}" thành công!`
    };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}

function apiSaveSettings(driveFolderInput, masterSheetInput, banNganhWebAppUrlInput) {
  try {
    if (driveFolderInput) {
      const folderId = cleanIdFromInput(driveFolderInput);
      PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', folderId);
    }
    if (masterSheetInput) {
      const sheetId = cleanIdFromInput(masterSheetInput);
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', sheetId);
    }
    if (banNganhWebAppUrlInput !== undefined && banNganhWebAppUrlInput !== null) {
      const cleanUrl = banNganhWebAppUrlInput.trim();
      PropertiesService.getScriptProperties().setProperty('BAN_NGANH_WEBAPP_URL', cleanUrl);

      if (cleanUrl) {
        const ministries = sheetFindAll(SHEET_NAMES.BAN_NGANH);
        ministries.forEach(m => {
          if (m.spreadsheetId) {
            const dynamicUrl = `${cleanUrl}?sheetId=${encodeURIComponent(m.spreadsheetId)}&banNganhId=${encodeURIComponent(m.id)}&title=${encodeURIComponent(m.tenBN)}`;
            sheetUpdate(SHEET_NAMES.BAN_NGANH, m.id, { webAppUrl: dynamicUrl });
          }
        });
      }
    }

    return { success: true, message: 'Đã lưu cấu hình và đồng bộ link Web App Ban Ngành thành công!' };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
}
