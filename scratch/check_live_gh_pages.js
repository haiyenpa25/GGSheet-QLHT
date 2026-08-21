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
  const url = 'https://haiyenpa25.github.io/GGSheet-QLHT/ban-nganh.html?v=' + Date.now();
  console.log('Fetching live GitHub Pages:', url);
  const res = await fetchUrl(url);
  console.log('Status code:', res.statusCode);
  console.log('Contains AKfycbzn (old):', res.body.includes('AKfycbzn'));
  console.log('Contains AKfycbyz (new):', res.body.includes('AKfycbyz'));
  console.log('Contains fetchJSONP:', res.body.includes('fetchJSONP'));
}

main().catch(console.error);
