const fs = require('fs');
const code = fs.readFileSync('QuanLyBanNganh/Code.gs', 'utf8');

const regex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
let match;
const functions = [];
while ((match = regex.exec(code)) !== null) {
  functions.push(match[1]);
}
console.log('Defined functions in Code.gs:', functions);

const jsCode = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8');
const gasCalls = [];
const gasRegex = /runGAS\(\s*['"]([a-zA-Z0-9_$]+)['"]/g;
while ((match = gasRegex.exec(jsCode)) !== null) {
  gasCalls.push(match[1]);
}
console.log('runGAS calls in JavaScript.html:', [...new Set(gasCalls)]);

const missing = [...new Set(gasCalls)].filter(f => !functions.includes(f));
console.log('MISSING FUNCTIONS IN CODE.GS:', missing);
