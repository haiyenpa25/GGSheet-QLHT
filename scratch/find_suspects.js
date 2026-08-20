const fs = require('fs');

const lines = fs.readFileSync('QuanLyBanNganh/JavaScript.html', 'utf8').split('\n');

const suspects = [
  'Helpers',   'resolve',   'CACHE',
  'VIEW',      'Algorithm', 'H',
  'View',      'Excel',     'ENGINE',
  'Tabs',      'danh',      'n',
  'KT',        'I',         'II',
  'III',       'IV',        'banner',
  'Scope',     'CONTROL',   'CENTER',
  'MESSAGING', 'T', 'showLoading'
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let s of suspects) {
    const re = new RegExp(`(?<![\\.\\w$])${s}\\s*\\(`, 'g');
    if (re.test(line)) {
      console.log(`Line ${i + 1}: ${s} -> ${line.trim()}`);
    }
  }
}
