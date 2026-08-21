const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html');
let content = fs.readFileSync(jsPath, 'utf8');

// Replace all <!-- ... --> with empty string or standard JS comment
const cleaned = content.replace(/<!--[\s\S]*?-->/g, '');

fs.writeFileSync(jsPath, cleaned, 'utf8');
console.log('✅ Removed all HTML comments from JavaScript.html successfully!');
