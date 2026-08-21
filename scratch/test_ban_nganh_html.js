const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'ban-nganh.html'), 'utf8');

// Extract script tags
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const src = match[1].trim();
  if (!src) continue;
  try {
    new vm.Script(src, { filename: `script_${count}.js` });
    console.log(`✅ Script #${count} is VALID! (${src.length} chars)`);
  } catch (e) {
    console.error(`❌ Script #${count} has syntax error:`, e.message);
  }
}
