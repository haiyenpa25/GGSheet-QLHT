const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://script.google.com/macros/s/AKfycbznG9ns1n1hqGj6gwqeuOZWZebA1tDOdpt07858Y_BKdjfVsyKMXkutud1beTtwgEZWjA/exec';
  console.log('Fetching URL:', url);
  const resp = await fetchUrl(url);
  console.log('Status code:', resp.statusCode);
  fs.writeFileSync(path.join(__dirname, 'served_gas.html'), resp.body, 'utf8');
  console.log('Saved response to scratch/served_gas.html, length:', resp.body.length);
}

main().catch(console.error);
