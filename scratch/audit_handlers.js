const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'QuanLyBanNganh', 'Index.html'), 'utf8');
const jsHtml = fs.readFileSync(path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html'), 'utf8');

// Find all onclick, onchange, oninput, onsubmit in Index.html
const handlerRegex = /\b(onclick|onchange|oninput|onsubmit|onkeyup)="([^"]+)"/g;
const missingHandlers = [];

let match;
while ((match = handlerRegex.exec(indexHtml)) !== null) {
  const handlerCode = match[2];
  // extract function name like foo() or foo(this) or foo('bar')
  const fnMatch = handlerCode.match(/^([a-zA-Z0-9_$]+)\s*\(/);
  if (fnMatch) {
    const fnName = fnMatch[1];
    if (fnName === 'switchLanguage' || fnName === 'alert' || fnName === 'console' || fnName === 'event') continue;
    // Check if fnName is defined in jsHtml
    const regex1 = new RegExp(`function\\s+${fnName}\\b`);
    const regex2 = new RegExp(`const\\s+${fnName}\\s*=`);
    const regex3 = new RegExp(`let\\s+${fnName}\\s*=`);
    const regex4 = new RegExp(`var\\s+${fnName}\\s*=`);
    const regex5 = new RegExp(`window\\.${fnName}\\s*=`);

    if (!regex1.test(jsHtml) && !regex2.test(jsHtml) && !regex3.test(jsHtml) && !regex4.test(jsHtml) && !regex5.test(jsHtml)) {
      missingHandlers.push({ fnName, code: handlerCode });
    }
  }
}

console.log('Missing handlers in JavaScript.html:');
console.log(JSON.stringify(missingHandlers, null, 2));
