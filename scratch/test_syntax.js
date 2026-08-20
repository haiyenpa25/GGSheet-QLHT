const fs = require('fs');
const code = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8').replace(/<\/?script>/g, '');

const vm = require('vm');
try {
  new vm.Script(code, { filename: 'JavaScript.html' });
  console.log('SUCCESS: No syntax error!');
} catch (err) {
  console.error('Syntax error at:', err.stack);
}
