const https = require('https');

function testUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      console.log('Status:', res.statusCode);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('Redirect to:', res.headers.location);
        return resolve(testUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

testUrl('https://script.google.com/macros/s/AKfycbz7e9ZVchhCfuTs10-ldapfDMl3ZzqlB2jQz7nCsyFpQXzHJk6c2AYvM_qOs9MODZZ8/exec?action=apiGetDashboardData')
  .then(body => {
    console.log('Body length:', body.length);
    console.log('Body sample:', body.slice(0, 300));
  })
  .catch(console.error);
