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
  console.log('Testing Master apiLogin:');
  const url = 'https://script.google.com/macros/s/AKfycbwWOhHsZolmnD5fjNNYKATkUmtwEqQwuvEN_5YAXpUab57UqsyRaMAzvPk0A8XhFl20/exec?action=apiLogin&username=admin&password=' + encodeURIComponent('Haiyen@2026') + '&callback=loginCb';
  const res = await testJsonp(url);
  console.log('Login result:', res.slice(0, 300));
}

main().catch(console.error);
