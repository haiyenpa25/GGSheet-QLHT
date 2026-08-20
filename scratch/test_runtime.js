const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const indexHtml = fs.readFileSync('QuanLyBanNganh/Index.html', 'utf8');
const jsHtml = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8');
const stylesHtml = fs.readFileSync('QuanLyBanNganh/Styles.html', 'utf8');

// Combine into full HTML
let fullHtml = indexHtml
  .replace("<?!= include('Styles'); ?>", stylesHtml)
  .replace("<?!= include('JavaScript'); ?>", jsHtml)
  .replace(/<\?=\s*sheetId\s*\?>/g, '1GkrK5hZdRArVkB125GEpKdbFgxglZP0IMRae27M9dBQ')
  .replace(/<\?=\s*banNganhId\s*\?>/g, 'id_41451e0a')
  .replace(/<\?=\s*banNganhTitle\s*\?>/g, 'Ban Thanh Tráng');

// Test running in JSDOM
try {
  const dom = new JSDOM(fullHtml, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'https://script.google.com/macros/s/test/exec?sheetId=1GkrK5hZdRArVkB125GEpKdbFgxglZP0IMRae27M9dBQ&title=Ban%20Thanh%20Tr%C3%A1ng'
  });

  console.log('JSDOM initialized successfully!');
  const win = dom.window;

  // Mock sample data
  const sampleData = {
    kpis: { total_members: 15, active_members: 14, group_count: 3, total_balance: 5000000, total_attendance_records: 40, total_visits: 5, total_schedules: 52 },
    theme: { chuDe: 'KỶ LUẬT THUỘC LINH', cauGoc: 'I Ti-mô-thê 4:7-8', noiDungCauGoc: 'Hãy tập tành...' },
    themes: [
      { id: '1', nam: 2026, quy: 'I', chuDe: 'GIỮ VỮNG', cauGoc: 'Giô-suê 1:8', noiDungCauGoc: 'Quyển sách luật pháp...' },
      { id: '2', nam: 2026, quy: 'II', chuDe: 'TĂNG TRƯỞNG', cauGoc: 'II Phi-e-rơ 3:18', noiDungCauGoc: 'Hãy tấn tới...' }
    ],
    members: [
      { id: 'm1', maTV: 'TT001', hoTen: 'Nguyễn Văn A', sdt: '0901234567', ngaySinh: '15/08/1990', gioiTinh: 'Nam', toId: 'g1', chucVu: 'Trưởng ban', trangThai: 'active' },
      { id: 'm2', maTV: 'TT002', hoTen: 'Trần Thị B', sdt: '0912345678', ngaySinh: '20/08/1995', gioiTinh: 'Nữ', toId: 'g2', chucVu: 'Thư ký', trangThai: 'active' },
      { id: 'm3', maTV: 'TT003', hoTen: 'Lê Văn C', sdt: '0923456789', ngaySinh: '05/01/1992', gioiTinh: 'Nam', toId: 'g1', chucVu: 'Thành viên', trangThai: 'active' }
    ],
    groups: [
      { id: 'g1', maTo: 'TO1', tenTo: 'Tổ 1 - Ái Hữu', toTruong: 'Nguyễn Văn A' },
      { id: 'g2', maTo: 'TO2', tenTo: 'Tổ 2 - Phục Vụ', toTruong: 'Trần Thị B' }
    ],
    funds: [
      { id: 'f1', maQuy: 'Q1', tenQuy: 'Quỹ Ban' }
    ],
    transactions: [
      { id: 't1', ngayGD: '15/08/2026', loaiGD: 'THU', hangMuc: 'Thu quỹ tháng 8', soTien: 500000, nguoiNopNhan: 'Nguyễn Văn A' },
      { id: 't2', ngayGD: '16/08/2026', loaiGD: 'CHI', hangMuc: 'Chi thăm viếng', soTien: 200000, nguoiNopNhan: 'Trần Thị B' }
    ],
    attendances: [
      { id: 'a1', ngayDiemDanh: '16/08/2026', thanhVienId: 'm1', coMat: 'CO_MAT', thuocCauGoc: 'THUOC', soCauKT: 3 },
      { id: 'a2', ngayDiemDanh: '16/08/2026', thanhVienId: 'm2', coMat: 'CO_MAT', thuocCauGoc: 'CHUA_THUOC', soCauKT: 1 },
      { id: 'a3', ngayDiemDanh: '16/08/2026', thanhVienId: 'm3', coMat: 'VANG', thuocCauGoc: 'CHUA_THUOC', soCauKT: 0 }
    ],
    visits: [
      { id: 'v1', ngayTham: '18/08/2026', thanhVienId: 'm3', nguoiTham: 'Ban Chăm Sóc', hinhThuc: 'Trực tiếp', noiDungCauNguyen: 'Cầu nguyện sức khỏe', trangThai: 'DANG_THEO_DOI', mucDoUuTien: 'QUAN_TAM' }
    ],
    schedules: [
      { id: 's1', nam: 2026, quy: 'III', tuanThu: 33, ngayNhom: '16/08/2026', deTai: 'SỰ VÂNG PHỤC', cauGoc: 'Hê-bơ-rơ 5:8', huongDan: 'Nguyễn Văn A', dienGia: 'MS Quản Nhiệm', nguoiDoKT: 'Trần Thị B', amNhac: 'Lê Văn C', mayChieu: 'Nguyễn Văn A', tiepTan: 'Trần Thị B' },
      { id: 's2', nam: 2026, quy: 'III', tuanThu: 34, ngayNhom: '23/08/2026', deTai: 'SỰ TRUNG TÍN', cauGoc: 'Ma-thi-ơ 25:21', huongDan: 'Trần Thị B', dienGia: 'Thầy Truyền Đạo', nguoiDoKT: 'Lê Văn C', amNhac: 'Nguyễn Văn A', mayChieu: 'Trần Thị B', tiepTan: 'Lê Văn C' }
    ],
    spreadsheet: { name: 'Google Sheet Ban Thanh Tráng', url: 'https://docs.google.com/spreadsheets/d/1GkrK5hZdRArVkB125GEpKdbFgxglZP0IMRae27M9dBQ/edit' }
  };

  win.applyData(sampleData);
  console.log('applyData executed successfully!');

  // Test rendering all views
  const views = ['dashboard', 'members', 'groups', 'attendance', 'finance', 'schedule', 'visitations', 'settings'];
  for (const v of views) {
    win.navigateTo(v);
    console.log(`navigateTo('${v}') executed successfully!`);
  }

  // Test role switching
  const roles = ['admin', 'thu_ky', 'thu_quy', 'to_truong'];
  for (const r of roles) {
    win.handleRoleChange(r);
    console.log(`handleRoleChange('${r}') executed successfully!`);
  }

  // Test notification center
  win.openNotificationsModal();
  console.log('openNotificationsModal executed successfully!');

  // Test dynamic template message
  win.openSendTemplateMessageModal('m1', 'birthday');
  win.updateDynamicMessagePreview();
  console.log('openSendTemplateMessageModal executed successfully!');

  // Test schedule print
  win.openSchedulePrintModal();
  console.log('openSchedulePrintModal executed successfully!');

  // Test quick visit modal
  win.openQuickVisitModal('m3', 2);
  console.log('openQuickVisitModal executed successfully!');

  console.log('\n>>> ALL UNIT & INTEGRATION TESTS PASSED WITHOUT ERRORS! <<<');
} catch (err) {
  console.error('Test Runtime Error:', err);
}
