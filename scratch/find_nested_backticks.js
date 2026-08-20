const fs = require('fs');
const content = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8');
const lines = content.split('\n');

let inTemplate = false;
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Simple check: count backticks on line
  const backtickIndices = [];
  for (let c = 0; c < line.length; c++) {
    if (line[c] === '`' && (c === 0 || line[c - 1] !== '\\')) {
      backtickIndices.push(c);
    }
  }
  
  if (backtickIndices.length > 2) {
    console.log(`Line ${i + 1} has ${backtickIndices.length} backticks: ${line.trim()}`);
  }
  if (line.includes('${') && line.includes('`')) {
    const idxDollar = line.indexOf('${');
    const idxTick = line.indexOf('`', idxDollar);
    if (idxTick !== -1) {
      console.log(`Line ${i + 1} has nested template: ${line.trim()}`);
    }
  }
}
