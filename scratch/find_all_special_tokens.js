const fs = require('fs');
const path = require('path');

const jsContent = fs.readFileSync(path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html'), 'utf8');

// Check for any <? or ?> inside JavaScript.html
const matches = jsContent.match(/<\?[\s\S]*?\?>/g);
console.log('Template tags inside JavaScript.html:', matches);

// Check for unclosed template strings (backticks)
const backtickCount = (jsContent.match(/`/g) || []).length;
console.log('Total backticks (must be even):', backtickCount, backtickCount % 2 === 0 ? '✅ EVEN' : '❌ ODD (UNCLOSED BACKTICK!)');

// Check line-by-line for non-ASCII or unusual characters
const lines = jsContent.split('\n');
console.log('Total lines in JavaScript.html:', lines.length);

// Try evaluating chunks or whole with ES6 parser
const acorn = require('acorn');
try {
  const pureJs = jsContent.replace(/^<script>/i, '').replace(/<\/script>$/i, '');
  acorn.parse(pureJs, { ecmaVersion: 2020 });
  console.log('✅ Acorn parsing SUCCESS: JavaScript.html is 100% valid ECMAScript 2020!');
} catch (e) {
  console.error('❌ Acorn Parse Error:', e);
}
