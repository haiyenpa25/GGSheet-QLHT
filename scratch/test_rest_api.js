const https = require('https');

function testApi(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('Redirecting to:', res.headers.location);
        return resolve(testApi(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://script.google.com/macros/s/AKfycbznG9ns1n1hqGj6gwqeuOZWZebA1tDOdpt07858Y_BKdjfVsyKMXkutud1beTtwgEZWjA/exec?action=apiGetInitialData&sheetId=13oCKGzsOyy3x9VrsI-NNxFaXBTpdOvveUoTiWegcEZw';
  console.log('Testing REST API GET request:');
  const res = await testApi(url);
  console.log('Status code:', res.statusCode);
  try {
    const json = JSON.parse(res.body);
    console.log('API Response SUCCESS! success:', json.success, 'members:', (json.data && json.data.members ? json.data.members.length : 0));
  } catch (e) {
    console.log('Response body (not JSON, likely HTML redirect):', res.body.slice(0, 500));
  }
}

main().catch(console.error);
