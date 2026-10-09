const https = require('https');

function makeRequest(url, method = 'GET', postData = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VibeNoww-Verifier/1.0',
        ...headers
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing Health Endpoint ---');
  const health = await makeRequest('https://vibenoww.com/health');
  console.log('Health:', health.body);

  console.log('\n--- 2. Testing Photographers List (Clean Database: Expected 0 or creators created) ---');
  const phots = await makeRequest('https://vibenoww.com/api/photographers');
  console.log('Status:', phots.status);
  console.log('Photographers count:', Array.isArray(phots.body) ? phots.body.length : phots.body);

  console.log('\n--- 3. Testing Admin Login with default clean credentials (admin@vibenoww.com / 123) ---');
  const login = await makeRequest('https://vibenoww.com/api/auth/login', 'POST', {
    email: 'admin@vibenoww.com',
    password: '123'
  });
  console.log('Login Status:', login.status);
  console.log('Login Response:', login.body);

  if (login.body && login.body.token) {
    console.log('\n--- 4. Testing Admin Dashboard API with Auth Token ---');
    const adminOrders = await makeRequest('https://vibenoww.com/api/admin/orders', 'GET', null, {
      'Authorization': 'Bearer ' + login.body.token
    });
    console.log('Admin Orders Status:', adminOrders.status);
    console.log('Admin Orders:', adminOrders.body);

    const adminPhots = await makeRequest('https://vibenoww.com/api/admin/photographers', 'GET', null, {
      'Authorization': 'Bearer ' + login.body.token
    });
    console.log('Admin Photographers Status:', adminPhots.status);
    console.log('Admin Photographers:', adminPhots.body);
  }
}

runTests();
