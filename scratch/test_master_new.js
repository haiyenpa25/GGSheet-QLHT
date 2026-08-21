const https = require('https');

function testJsonp(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      console.log('HTTP Status:', res.statusCode);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('Redirect to:', res.headers.location);
        return resolve(testJsonp(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

testJsonp('https://script.google.com/macros/s/AKfycbwWOhHsZolmnD5fjNNYKATkUmtwEqQwuvEN_5YAXpUab57UqsyRaMAzvPk0A8XhFl20/exec?action=apiGetInitialData&callback=testMasterCb')
  .then(body => {
    console.log('Master JSONP Body length:', body.length);
    console.log('Master JSONP Body prefix:', body.slice(0, 300));
  })
  .catch(console.error);
