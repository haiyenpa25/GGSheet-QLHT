const fs = require('fs');

const jsContent = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8')
  .replace(/<script[^>]*>/gi, '')
  .replace(/<\/script>/gi, '');

// Find standalone function calls (not object.method(...)): (?<!\.)\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(
const standaloneMatches = jsContent.matchAll(/(?<![\.\w$])([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
const standaloneCalled = new Set();
for (const m of standaloneMatches) {
  standaloneCalled.add(m[1]);
}

const defMatches = jsContent.matchAll(/(?:function|const|let|var)\s+([a-zA-Z0-9_$]+)/g);
const defined = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'new',
  'console', 'window', 'document', 'localStorage', 'sessionStorage', 'fetch', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent',
  'decodeURIComponent', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON', 'RegExp',
  'Error', 'TypeError', 'RangeError', 'Set', 'Map', 'Promise', 'URLSearchParams', 'navigator', 'location',
  'history', 'alert', 'confirm', 'prompt', 'google', 'Utilities', 'Session', 'SpreadsheetApp', 'DriveApp', 'ContentService',
  'PropertiesService', 'LockService', 'HtmlService', 'require', 'Blob', 'Intl', 'URL', 'Event'
]);

for (const m of defMatches) {
  defined.add(m[1]);
}

const missing = [];
for (const c of standaloneCalled) {
  if (!defined.has(c)) {
    missing.push(c);
  }
}

console.log('MISSING STANDALONE FUNCTIONS:', missing);
