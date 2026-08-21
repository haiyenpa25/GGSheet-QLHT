const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.join(__dirname, '..', 'QuanLyBanNganh');
let indexHtml = fs.readFileSync(path.join(baseDir, 'Index.html'), 'utf8');
const stylesHtml = fs.readFileSync(path.join(baseDir, 'Styles.html'), 'utf8');
const jsHtml = fs.readFileSync(path.join(baseDir, 'JavaScript.html'), 'utf8');

// Simulate GAS include and template vars
let combined = indexHtml
  .replace(/<\?!=\s*include\('Styles'\);\s*\?>/g, stylesHtml)
  .replace(/<\?!=\s*include\('JavaScript'\);\s*\?>/g, jsHtml)
  .replace(/<\?=\s*sheetId\s*\?>/g, '1qI_qFmXjbnnw21qPdxeWSUpBH9itFp6TznpAKMZZwME')
  .replace(/<\?=\s*banNganhId\s*\?>/g, 'id_41451e0a')
  .replace(/<\?=\s*banNganhTitle\s*\?>/g, 'Ban Thanh Tráng');

console.log('Combined HTML total length:', combined.length);

// Extract all <script>...</script> blocks
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;

while ((match = scriptRegex.exec(combined)) !== null) {
  scriptIndex++;
  const code = match[1];
  console.log(`\nTesting Script block #${scriptIndex} (length: ${code.length})...`);
  
  // Calculate line offset in combined HTML
  const linesBefore = combined.substring(0, match.index).split('\n').length;
  console.log(`Script block starts at combined HTML line ~${linesBefore}`);

  try {
    new vm.Script(code, { filename: `script_block_${scriptIndex}.js`, lineOffset: 0 });
    console.log(`✅ Script block #${scriptIndex} is VALID!`);
  } catch (err) {
    console.error(`❌ SYNTAX ERROR in Script block #${scriptIndex}:`, err.message);
    const errStack = err.stack;
    console.error(errStack);
    
    // Print lines around error
    const codeLines = code.split('\n');
    console.log('--- Problematic code snippet ---');
    // If we have line number
    const matchLine = err.stack && err.stack.match(/script_block_\d+\.js:(\d+)/);
    if (matchLine) {
      const lineNum = parseInt(matchLine[1], 10);
      for (let l = Math.max(1, lineNum - 5); l <= Math.min(codeLines.length, lineNum + 5); l++) {
        console.log(`${l === lineNum ? '>>>' : '   '} [${l}] ${codeLines[l - 1]}`);
      }
    }
  }
}
