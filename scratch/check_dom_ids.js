const fs = require('fs');

const indexHtml = fs.readFileSync('QuanLyBanNganh/Index.html', 'utf8');
const jsHtml = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8');

// Find all document.getElementById('id')
const idRegex = /document\.getElementById\(\s*['"]([^'"]+)['"]\s*\)/g;
let match;
const usedIds = new Set();
while ((match = idRegex.exec(jsHtml)) !== null) {
  usedIds.add(match[1]);
}

const missingIds = [];
usedIds.forEach(id => {
  // Check if id exists as id="..." in Index.html or JavaScript.html
  const hasInIndex = indexHtml.includes(`id="${id}"`) || indexHtml.includes(`id='${id}'`);
  const hasInJs = jsHtml.includes(`id="${id}"`) || jsHtml.includes(`id='${id}'`);
  if (!hasInIndex && !hasInJs) {
    missingIds.push(id);
  }
});

console.log('Total getElementById searched:', usedIds.size);
console.log('MISSING DOM IDs:', missingIds);
