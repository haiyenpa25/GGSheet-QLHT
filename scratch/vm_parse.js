const fs = require('fs');
const js = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8').trim()
  .replace(/^<script>/i, '')
  .replace(/<\/script>$/i, '');

// Parse line by line with acorn or vm
const vm = require('vm');
try {
  new vm.Script(js);
  console.log('VM Script parsed SUCCESSFULLY!');
} catch (e) {
  console.error('VM Parse Error:', e.message);
  console.error('Line/Col:', e.lineNumber, e.columnNumber);
  console.error('Stack:', e.stack);
}
