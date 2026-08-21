const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'served_gas.html'), 'utf8');
console.log('--- START OF CONTENT (first 1500 chars) ---');
console.log(content.slice(0, 1500));
console.log('--- END OF CONTENT (last 1500 chars) ---');
console.log(content.slice(-1500));
