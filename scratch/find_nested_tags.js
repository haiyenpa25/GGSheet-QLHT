const fs = require('fs');
const path = require('path');

const jsContent = fs.readFileSync(path.join(__dirname, '..', 'QuanLyBanNganh', 'JavaScript.html'), 'utf8');

// Find any <script or </script inside the JS body (excluding first and last line)
const innerJs = jsContent.substring(jsContent.indexOf('\n') + 1, jsContent.lastIndexOf('</script>'));

const tagMatches = innerJs.match(/<\/?script\b[^>]*>/gi);
console.log('Nested script tags in JavaScript.html:', tagMatches);

const htmlCommentMatches = innerJs.match(/<!--|-->/g);
console.log('HTML comment markers in JavaScript.html:', htmlCommentMatches);
