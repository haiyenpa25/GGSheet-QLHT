const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const qlbnDir = path.join(rootDir, 'QuanLyBanNganh');

// Read source files
let indexHtml = fs.readFileSync(path.join(qlbnDir, 'Index.html'), 'utf8');
const stylesHtml = fs.readFileSync(path.join(qlbnDir, 'Styles.html'), 'utf8');
let jsHtml = fs.readFileSync(path.join(qlbnDir, 'JavaScript.html'), 'utf8');

// Ensure previewBulkMembers alias exists
if (!jsHtml.includes('function previewBulkMembers')) {
  jsHtml = jsHtml.replace('function handlePreviewBulkInput() {', 'function previewBulkMembers() { return handlePreviewBulkInput(); }\n\n  function handlePreviewBulkInput() {');
  fs.writeFileSync(path.join(qlbnDir, 'JavaScript.html'), jsHtml, 'utf8');
  console.log('✅ Added previewBulkMembers alias to JavaScript.html');
}

// 1. Build standalone ban-nganh.html for GitHub Pages
let standaloneHtml = indexHtml;

// Replace GAS template tags with actual contents
standaloneHtml = standaloneHtml.replace("<?!= include('Styles'); ?>", stylesHtml);
standaloneHtml = standaloneHtml.replace("<?!= include('JavaScript'); ?>", jsHtml);

// Clean up GAS server config placeholder for static GitHub Pages
standaloneHtml = standaloneHtml.replace("String('<?= sheetId ?>').trim()", "''");
standaloneHtml = standaloneHtml.replace("String('<?= banNganhId ?>').trim()", "'id_41451e0a'");
standaloneHtml = standaloneHtml.replace("String('<?= banNganhTitle ?>').trim()", "'Ban Thanh Tráng'");

const targetBanNganhHtml = path.join(rootDir, 'ban-nganh.html');
fs.writeFileSync(targetBanNganhHtml, standaloneHtml, 'utf8');
console.log('✅ Created standalone ban-nganh.html for GitHub Pages (Size:', fs.statSync(targetBanNganhHtml).size, 'bytes)');

const targetThanhTrangHtml = path.join(rootDir, 'thanh-trang.html');
fs.writeFileSync(targetThanhTrangHtml, standaloneHtml, 'utf8');
console.log('✅ Created short alias thanh-trang.html for GitHub Pages (Size:', fs.statSync(targetThanhTrangHtml).size, 'bytes)');

console.log('Build completed successfully!');
