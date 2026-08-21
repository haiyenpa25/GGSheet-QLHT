const https = require('https');

function testApi(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      console.log('HTTP Status:', res.statusCode);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('Redirect to:', res.headers.location);
        return resolve(testApi(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://script.google.com/macros/s/AKfycbyzVgom-BMZOadYkoYOQRZ3W7lLZRRGc2ofU1rbqQWTxD7x-QD8UXDW33vuuNsJxViYvw/exec?action=apiGetInitialData&sheetId=13oCKGzsOyy3x9VrsI-NNxFaXBTpdOvveUoTiWegcEZw';
  console.log('Testing NEW Public Deployment URL:', url);
  const res = await testApi(url);
  console.log('Final Status code:', res.statusCode);
  try {
    const json = JSON.parse(res.body);
    console.log('🎉 SUCCESS! JSON Response:');
    console.log('Success:', json.success);
    console.log('Spreadsheet Name:', json.data && json.data.spreadsheet ? json.data.spreadsheet.name : 'N/A');
    console.log('Members count:', json.data && json.data.members ? json.data.members.length : 0);
    console.log('Groups count:', json.data && json.data.groups ? json.data.groups.length : 0);
    console.log('Funds count:', json.data && json.data.funds ? json.data.funds.length : 0);
    console.log('KPIs:', json.data ? json.data.kpis : {});
  } catch (e) {
    console.log('Not JSON, body slice:', res.body.slice(0, 400));
  }
}

main().catch(console.error);
