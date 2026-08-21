const fs = require('fs');

const indexHtml = fs.readFileSync('QuanLyBanNganh/Index.html', 'utf8');
const jsHtml = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8');

// Find all onclick="functionName(...)" in Index.html
const onclickRegex = /onclick="([a-zA-Z0-9_$]+)\s*\(/g;
const onclicks = new Set();
let m;
while ((m = onclickRegex.exec(indexHtml)) !== null) {
  onclicks.add(m[1]);
}

// Find all function definitions in JavaScript.html: function foo(, const foo =, let foo =, var foo =, window.foo =
const defRegex = /(?:function|const|let|var|window\.)\s+([a-zA-Z0-9_$]+)/g;
const defined = new Set();
while ((m = defRegex.exec(jsHtml)) !== null) {
  defined.add(m[1]);
}

const missing = [];
for (let fn of onclicks) {
  if (!defined.has(fn)) {
    missing.push(fn);
  }
}

console.log('ALL ONCLICK FUNCTIONS IN INDEX.HTML:', [...onclicks]);
console.log('====================================');
console.log('MISSING FUNCTIONS CALLED BY ONCLICK:', missing);
