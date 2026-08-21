const fs = require('fs');
const path = require('path');

const jsContent = fs.readFileSync(path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html'), 'utf8');

const dollarMatches = jsContent.match(/\$[0-9&'`]/g);
console.log('Dollar matches in JavaScript.html:', dollarMatches);

const str1 = 'HELLO <?!= include("JavaScript"); ?> WORLD';
const broken = str1.replace(/<\?!\s*=\s*include\(['"]JavaScript['"]\);?\s*\?>/g, jsContent);
const fixed = str1.replace(/<\?!\s*=\s*include\(['"]JavaScript['"]\);?\s*\?>/g, () => jsContent);

console.log('Broken length:', broken.length);
console.log('Fixed length:', fixed.length);
console.log('Lengths match?', broken.length === fixed.length);
