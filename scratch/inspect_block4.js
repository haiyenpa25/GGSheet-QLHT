const fs = require('fs');
const index = fs.readFileSync('QuanLyBanNganh/Index.html', 'utf8');
const styles = fs.readFileSync('QuanLyBanNganh/Styles.html', 'utf8');
const js = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8');

const combined = index
  .replace("<?!= include('Styles'); ?>", styles)
  .replace("<?!= include('JavaScript'); ?>", js);

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;
while ((match = scriptRegex.exec(combined)) !== null) {
  scriptIndex++;
  if (scriptIndex === 4) {
    const scriptContent = match[1];
    console.log('Script block 4 first 500 chars:');
    console.log(scriptContent.substring(0, 500));
  }
}
