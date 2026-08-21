const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://haiyenpa25.github.io/GGSheet-QLHT/index.html?v=' + Date.now();
  console.log('Fetching live index.html:', url);
  const res = await fetchUrl(url);
  console.log('Status code:', res.statusCode);
  console.log('Contains "Đường dẫn Web App:":', res.body.includes('Đường dẫn Web App:'));
  console.log('Contains "getMinistryCleanPath":', res.body.includes('getMinistryCleanPath'));
  console.log('Contains "copyToClipboard":', res.body.includes('copyToClipboard'));
}

main().catch(console.error);
