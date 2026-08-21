const fs = require('fs');
const path = require('path');
const vm = require('vm');

const indexPath = path.join(__dirname, '..', 'QuanLyBanNganh', 'Index.html');
const content = fs.readFileSync(indexPath, 'utf8');

// Match all inline event handlers: onclick="...", onchange="...", etc.
const eventRegex = /\s(on[a-z]+)="([^"]*)"/gi;
let match;
let count = 0;
let errors = 0;

while ((match = eventRegex.exec(content)) !== null) {
  count++;
  const eventName = match[1];
  const eventCode = match[2];

  // Decode basic HTML entities like &quot;, &#39;, &amp;
  const decodedCode = eventCode
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  try {
    new vm.Script(decodedCode);
  } catch (err) {
    errors++;
    console.error(`❌ Syntax Error in ${eventName}="${eventCode}":`, err.message);
  }
}

console.log(`Audited ${count} inline event handlers. Total errors: ${errors}`);
