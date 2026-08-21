const https = require('https');

function testJsonp(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(testJsonp(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://script.google.com/macros/s/AKfycbyzVgom-BMZOadYkoYOQRZ3W7lLZRRGc2ofU1rbqQWTxD7x-QD8UXDW33vuuNsJxViYvw/exec?action=apiGetInitialData&sheetId=13oCKGzsOyy3x9VrsI-NNxFaXBTpdOvveUoTiWegcEZw&callback=myCallbackTest';
  console.log('Testing JSONP URL:');
  const res = await testJsonp(url);
  console.log('Status code:', res.statusCode);
  console.log('Response body prefix:', res.body.slice(0, 200));
}

main().catch(console.error);
