// Simulate exactly how GAS builds the combined page (without Google's wrapper lines)
// and identify what's at line 595

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'QuanLyBanNganh', 'Index.html');
const stylesPath = path.join(__dirname, '..', 'QuanLyBanNganh', 'Styles.html');
const jsPath = path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html');

let indexContent = fs.readFileSync(indexPath, 'utf8');
const stylesContent = fs.readFileSync(stylesPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Simulate GAS template include resolution
indexContent = indexContent.replace("<?!= include('Styles'); ?>", stylesContent);
indexContent = indexContent.replace("<?!= include('JavaScript'); ?>", jsContent);

// Simulate template variable resolution
indexContent = indexContent
  .replace("<?= sheetId ?>", '13oCKGzsOyy3x9VrsI-NNxFaXBTpdOvveUoTiWegcEZw')
  .replace("<?= banNganhId ?>", 'id_41451e0a')
  .replace("<?= banNganhTitle ?>", 'Ban Thanh Tráng');

const lines = indexContent.split('\n');
console.log('Total combined lines:', lines.length);
console.log('\n=== Lines 590-605 (zero-indexed) of combined HTML: ===');
for (let i = 589; i <= 604 && i < lines.length; i++) {
  console.log(`Line ${i + 1}: ${lines[i]}`);
}

// Also check: lines 560-600 might be in styles.html or the HTML body
// Let's count precisely: find what "original file" line 595 corresponds to
const stylesLines = stylesContent.split('\n').length;
const indexBeforeStyles = indexContent.indexOf(stylesContent);

console.log('\n=== Precise breakdown: ===');
console.log(`Index lines before styles include: 54`);
console.log(`Styles lines: ${stylesLines}`);
console.log(`Index.html line 55 appears at combined line: ${54 + stylesLines}`);
console.log(`Combined line 595 maps to Index.html line: ${595 - stylesLines - 54 + 55}`);
