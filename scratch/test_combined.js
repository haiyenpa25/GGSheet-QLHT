const fs = require('fs');

const index = fs.readFileSync('QuanLyBanNganh/Index.html', 'utf8');
const styles = fs.readFileSync('QuanLyBanNganh/Styles.html', 'utf8');
const js = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8');

const combined = index
  .replace("<?!= include('Styles'); ?>", styles)
  .replace("<?!= include('JavaScript'); ?>", js)
  .replace("<?= sheetId ?>", '1GkrK5hZdRArVkB125GEpKdbFgxglZP0IMRae27M9dBQ')
  .replace("<?= banNganhId ?>", 'id_41451e0a')
  .replace("<?= banNganhTitle ?>", 'Ban Thanh Tráng');

// Extract all <script> blocks from combined
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;
while ((match = scriptRegex.exec(combined)) !== null) {
  scriptIndex++;
  const scriptContent = match[1];
  console.log(`\n--- Script block #${scriptIndex} (${scriptContent.length} bytes) ---`);
  
  // Calculate line offset
  const beforeScript = combined.substring(0, match.index);
  const startLine = beforeScript.split('\n').length;
  console.log(`Starts around line: ${startLine}`);
  
  try {
    new Function(scriptContent);
    console.log(`Script block #${scriptIndex} is VALID JavaScript!`);
  } catch (e) {
    console.error(`Script block #${scriptIndex} has SYNTAX ERROR:`, e.message);
    
    // Find exact line
    const scriptLines = scriptContent.split('\n');
    for (let l = 1; l <= scriptLines.length; l++) {
      try {
        new Function(scriptLines.slice(0, l).join('\n'));
      } catch (err) {
        if (!err.message.includes('Unexpected end of input') && !err.message.includes('missing }') && !err.message.includes('missing )')) {
          console.error(`Error near script sub-line ${l} (combined line ~${startLine + l - 1}): ${err.message}`);
          console.error(`Line content: ${scriptLines[l - 1]}`);
          break;
        }
      }
    }
  }
}
