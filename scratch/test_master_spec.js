/**
 * VALIDATION TEST SCRIPT FOR MASTER SPEC V2.0 IMPLEMENTATION
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

console.log('--- 1. Testing project.config.json in QuanLyHoiThanh & QuanLyBanNganh ---');
const htConfig = JSON.parse(fs.readFileSync(path.join(root, 'QuanLyHoiThanh', 'project.config.json'), 'utf8'));
const bnConfig = JSON.parse(fs.readFileSync(path.join(root, 'QuanLyBanNganh', 'project.config.json'), 'utf8'));

console.log('QuanLyHoiThanh config:', htConfig.name, htConfig.spreadsheetId);
console.log('QuanLyBanNganh config:', bnConfig.name, bnConfig.spreadsheetId);

if (htConfig.spreadsheetId !== '124O4hYFaxmZm1hg8FyRP4fci6hw84ziIg8o3eAUwMV0') {
  throw new Error('QuanLyHoiThanh spreadsheetId does not match!');
}
if (bnConfig.spreadsheetId !== '1qI_qFmXjbnnw21qPdxeWSUpBH9itFp6TznpAKMZZwME') {
  throw new Error('QuanLyBanNganh spreadsheetId does not match!');
}

console.log('--- 2. Checking Code.gs files ---');
const bnCode = fs.readFileSync(path.join(root, 'QuanLyBanNganh', 'Code.gs'), 'utf8');
const htCode = fs.readFileSync(path.join(root, 'QuanLyHoiThanh', 'Code.gs'), 'utf8');

if (!bnCode.includes('apiBulkImportMembers')) {
  throw new Error('QuanLyBanNganh/Code.gs is missing apiBulkImportMembers!');
}
if (!bnCode.includes('apiBatchAssignGroup')) {
  throw new Error('QuanLyBanNganh/Code.gs is missing apiBatchAssignGroup!');
}
if (!htCode.includes('BAN_NGANH_STATS')) {
  throw new Error('QuanLyHoiThanh/Code.gs is missing BAN_NGANH_STATS!');
}

console.log('--- 3. Checking batch files ---');
const updateAllBat = fs.readFileSync(path.join(root, 'update_all.bat'), 'utf8');
if (updateAllBat.includes('AKfycbzA9hu94R8')) {
  throw new Error('update_all.bat contains old deployment ID!');
}

console.log('✅ ALL TESTS PASSED 100%! Ready for production push & deploy.');
