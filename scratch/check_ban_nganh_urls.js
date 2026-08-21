const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'ban-nganh.html'), 'utf8');

console.log('ban-nganh.html total length:', content.length);
console.log('Contains BAN_NGANH_API_FALLBACK_URL:', content.includes('BAN_NGANH_API_FALLBACK_URL'));
console.log('Contains AKfycbzn:', content.includes('AKfycbzn'));
console.log('Contains AKfycbyz:', content.includes('AKfycbyz'));

// Find lines with fallback URL
content.split('\n').forEach((line, idx) => {
  if (line.includes('BAN_NGANH_API_FALLBACK_URL') || line.includes('AKfycb')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
