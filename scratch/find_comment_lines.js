const fs = require('fs');
const path = require('path');

const jsLines = fs.readFileSync(path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html'), 'utf8').split('\n');

jsLines.forEach((line, idx) => {
  if (line.includes('<!--') || line.includes('-->')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
