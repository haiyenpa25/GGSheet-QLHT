const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsContent = fs.readFileSync(path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html'), 'utf8').trim();

const pureJs = jsContent.replace(/^<script>/i, '').replace(/<\/script>$/i, '');

try {
  new vm.Script(pureJs, { filename: 'JavaScript.html' });
  console.log('✅ Node VM Script parse SUCCESS!');
} catch (e) {
  console.error('❌ Node VM Script Parse Error:', e);
}
