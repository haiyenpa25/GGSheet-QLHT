const https = require('https');

function testJsonp(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(testJsonp(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Testing BanNganh apiLogin:');
  const sheetId = '13oCKGzsOyy3x9VrsI-NNxFaXBTpdOvveUoTiWegcEZw';
  const url = 'https://script.google.com/macros/s/AKfycbyzVgom-BMZOadYkoYOQRZ3W7lLZRRGc2ofU1rbqQWTxD7x-QD8UXDW33vuuNsJxViYvw/exec?action=apiLogin&identifier=admin&password=123456&sheetId=' + sheetId + '&callback=bnLoginCb';
  const res = await testJsonp(url);
  console.log('BanNganh Login result:', res.slice(0, 300));
}

main().catch(console.error);
