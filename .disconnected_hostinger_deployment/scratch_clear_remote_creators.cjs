const https = require('https');

function clearCreators() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'vibenoww.com',
      port: 443,
      path: '/api/photographers/all-creators',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve(data);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function verify() {
  console.log('Clearing all creators from remote database...');
  await clearCreators();

  console.log('\nChecking /api/photographers to verify it is empty...');
  https.get('https://vibenoww.com/api/photographers', res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      console.log('GET /api/photographers response:', data);
    });
  });
}

verify();
