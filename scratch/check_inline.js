const fs = require('fs');
const index = fs.readFileSync('QuanLyBanNganh/Index.html', 'utf8');
const eventRegex = /\b(on[a-z]+)="([^"]*)"/gi;
let match;
let count = 0;
let errors = 0;
while ((match = eventRegex.exec(index)) !== null) {
  count++;
  const attr = match[1];
  const code = match[2];
  try {
    new Function(code);
  } catch (e) {
    errors++;
    console.error('Invalid inline code in ' + attr + '="' + code + '":', e.message);
  }
}
console.log('Checked ' + count + ' inline event handlers in Index.html. Errors: ' + errors);
