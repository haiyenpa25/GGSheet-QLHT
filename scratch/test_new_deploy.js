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
  const url = 'https://script.google.com/macros/s/AKfycbxdjMy3-x30MQskE5-8DCg0O9VyYmqg2MHWFxIwV1Vsj-QQg1vUSBt5U0ibQnEThovyOg/exec?action=apiGetInitialData&sheetId=13oCKGzsOyy3x9VrsI-NNxFaXBTpdOvveUoTiWegcEZw';
  console.log('Testing NEW Deployment URL:', url);
  const res = await testApi(url);
  console.log('Status code:', res.statusCode);
  try {
    const json = JSON.parse(res.body);
    console.log('API Response SUCCESS!', JSON.stringify({
      success: json.success,
      sheetName: json.data && json.data.spreadsheet ? json.data.spreadsheet.name : 'N/A',
      membersCount: json.data && json.data.members ? json.data.members.length : 0,
      groupsCount: json.data && json.data.groups ? json.data.groups.length : 0,
      fundsCount: json.data && json.data.funds ? json.data.funds.length : 0,
      kpis: json.data ? json.data.kpis : {}
    }, null, 2));
  } catch (e) {
    console.log('Response body (not JSON):', res.body.slice(0, 500));
  }
}

main().catch(console.error);
