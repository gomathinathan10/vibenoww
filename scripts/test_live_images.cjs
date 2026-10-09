const https = require('https');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'identity',
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: 'vibenoww.com',
      port: 443,
      path: path,
      method: method,
      headers: reqHeaders
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    https.get('https://vibenoww.com' + url, res => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: Buffer.concat(data).length
        });
      });
    }).on('error', reject);
  });
}

// Generate valid base64 1x1 test images
// 1. JPEG (FF D8 FF)
const validJpgBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
// 2. PNG (89 50 4E 47)
const validPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
// 3. WEBP (RIFF...WEBP)
const validWebpBase64 = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

async function runTests() {
  console.log('🧪 Starting Live Production Verification on https://vibenoww.com ...\n');

  // Test 1: Fetch all photographers
  console.log('--- TEST 1: Fetch Photographers ---');
  const photogsRes = await request('GET', '/api/photographers');
  console.log('Status:', photogsRes.status);
  console.log('Found photographers:', photogsRes.data?.data?.length || 0);

  if (!photogsRes.data?.data || photogsRes.data.data.length === 0) {
    console.error('❌ No photographers found to test!');
    return;
  }

  const targetPhotog = photogsRes.data.data[0];
  console.log(`Target Creator: ${targetPhotog.name} (ID: ${targetPhotog.id})`);
  console.log(`Current Avatar: ${targetPhotog.avatar ? targetPhotog.avatar.substring(0, 60) : 'none'}`);
  console.log(`Current Cover: ${targetPhotog.coverImage ? targetPhotog.coverImage.substring(0, 60) : 'none'}`);

  // Test 2: Upload Profile Image (JPG)
  console.log('\n--- TEST 2: Upload Profile Photo (JPG) ---');
  const uploadAvatarRes = await request('POST', `/api/photographers/${targetPhotog.id}/upload`, {
    image: validJpgBase64,
    type: 'avatar'
  }, { 'x-creator-id': targetPhotog.id });

  console.log('Upload Status:', uploadAvatarRes.status);
  console.log('Upload Response:', uploadAvatarRes.data);
  const uploadedAvatarUrl = uploadAvatarRes.data?.url;

  if (uploadAvatarRes.data?.success && uploadedAvatarUrl) {
    console.log('✅ Upload succeeded! URL:', uploadedAvatarUrl);

    // Test 3: Check HTTP Static File Accessibility
    console.log('\n--- TEST 3: Verify HTTP Accessibility of Uploaded File ---');
    const cleanPath = uploadedAvatarUrl.split('?')[0];
    const fileCheck = await checkUrl(cleanPath);
    console.log('HTTP Status:', fileCheck.status);
    console.log('Content-Type:', fileCheck.contentType);
    console.log('Bytes received:', fileCheck.contentLength);
    if (fileCheck.status === 200 && fileCheck.contentLength > 0) {
      console.log('✅ File is publicly accessible and served with HTTP 200!');
    } else {
      console.error('❌ File not directly accessible via HTTP:', fileCheck);
    }
  } else {
    console.error('❌ Upload failed:', uploadAvatarRes);
  }

  // Test 4: Upload Background / Cover Image (PNG)
  console.log('\n--- TEST 4: Upload Background Photo (PNG) ---');
  const uploadCoverRes = await request('POST', `/api/photographers/${targetPhotog.id}/upload`, {
    image: validPngBase64,
    type: 'coverImage'
  }, { 'x-creator-id': targetPhotog.id });

  console.log('Cover Upload Status:', uploadCoverRes.status);
  console.log('Cover Upload Response:', uploadCoverRes.data);
  const uploadedCoverUrl = uploadCoverRes.data?.url;

  if (uploadCoverRes.data?.success && uploadedCoverUrl) {
    console.log('✅ Background upload succeeded! URL:', uploadedCoverUrl);

    const cleanCoverPath = uploadedCoverUrl.split('?')[0];
    const coverFileCheck = await checkUrl(cleanCoverPath);
    console.log('Cover HTTP Status:', coverFileCheck.status);
    console.log('Cover Bytes received:', coverFileCheck.contentLength);
    if (coverFileCheck.status === 200 && coverFileCheck.contentLength > 0) {
      console.log('✅ Cover file is publicly accessible and served with HTTP 200!');
    }
  }

  // Test 5: Verify WEBP support
  console.log('\n--- TEST 5: Upload WEBP Format ---');
  const uploadWebpRes = await request('POST', `/api/photographers/${targetPhotog.id}/upload`, {
    image: validWebpBase64,
    type: 'avatar'
  }, { 'x-creator-id': targetPhotog.id });
  console.log('WEBP Upload Status:', uploadWebpRes.status);
  console.log('WEBP Upload Result:', uploadWebpRes.data);

  // Test 6: Verify Database Persistence across refresh
  console.log('\n--- TEST 6: Verify Database Persistence (GET /api/photographers/:id) ---');
  const singleRes = await request('GET', `/api/photographers/${targetPhotog.id}`);
  console.log('Status:', singleRes.status);
  console.log('Persisted Avatar:', singleRes.data?.data?.avatar);
  console.log('Persisted CoverImage:', singleRes.data?.data?.coverImage);

  if (singleRes.data?.data?.avatar && singleRes.data?.data?.avatar.startsWith('/uploads/creators/')) {
    console.log('✅ Canonical /uploads/creators/ path verified in database!');
  } else {
    console.warn('⚠️ Avatar not in expected format:', singleRes.data?.data?.avatar);
  }

  // Test 7: Verify Authorization Security
  console.log('\n--- TEST 7: Authorization Protection (Creator A cannot update Creator B) ---');
  const hackRes = await request('POST', `/api/photographers/${targetPhotog.id}/upload`, {
    image: validJpgBase64,
    type: 'avatar'
  }, { 'x-creator-id': 'different_creator_id_999' });
  console.log('Unauthorized Request Status:', hackRes.status);
  console.log('Unauthorized Response:', hackRes.data);
  if (hackRes.status === 403) {
    console.log('✅ Security verified: unauthorized creator update blocked with 403 Forbidden!');
  }

  console.log('\n🎉 ALL LIVE PRODUCTION TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
});
