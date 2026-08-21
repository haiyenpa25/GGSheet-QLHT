const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'served_gas.html'), 'utf8');

// Look for userCodeAppPanel or iframe or script contents
console.log('Contains userCodeAppPanel?', content.includes('userCodeAppPanel'));
console.log('Contains navigateTo?', content.includes('navigateTo'));
console.log('Contains initApp?', content.includes('initApp'));
console.log('Contains iframe?', content.includes('<iframe'));

// Find iframe src
const iframeMatch = content.match(/<iframe[^>]+src="([^">]+)"/i);
if (iframeMatch) {
  console.log('Iframe src:', iframeMatch[1]);
}

// Find all script tags in outer container
const scriptTags = content.match(/<script[\s\S]*?<\/script>/gi);
console.log('Outer script tags count:', scriptTags ? scriptTags.length : 0);
