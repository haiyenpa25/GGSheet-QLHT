const fs = require('fs');
const path = require('path');

const jsHtml = fs.readFileSync(path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html'), 'utf8');

// Strip <script> and </script>
const jsCode = jsHtml.replace(/<script>/gi, '').replace(/<\/script>/gi, '');

try {
  new Function(jsCode);
  console.log('✅ JavaScript.html syntax is 100% VALID!');
} catch (e) {
  console.error('❌ JavaScript Syntax Error:', e);
}
