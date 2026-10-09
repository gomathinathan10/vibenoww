const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function verifyAll() {
  console.log('=== 1. Testing https://vibenoww.com/ ===');
  const indexRes = await get('https://vibenoww.com/');
  console.log('Index HTML status:', indexRes.status);
  console.log('Contains vibenoww-symbol.svg:', indexRes.data.includes('vibenoww-symbol.svg'));
  console.log('Contains phone +91 7708320321:', indexRes.data.includes('7708320321'));
  console.log('Contains email vibenoww26@gmail.com:', indexRes.data.includes('vibenoww26@gmail.com'));
  console.log('Contains address Balabackiya Nagar:', indexRes.data.toLowerCase().includes('balabackiya'));

  console.log('\n=== 2. Testing https://vibenoww.com/images/vibenoww-symbol.svg ===');
  const svgRes = await get('https://vibenoww.com/images/vibenoww-symbol.svg');
  console.log('Symbol SVG status:', svgRes.status);
  console.log('Is valid SVG content:', svgRes.data.includes('<svg') && svgRes.data.includes('</svg>'));

  console.log('\n=== 3. Testing https://vibenoww.com/api/photographers ===');
  const photogsRes = await get('https://vibenoww.com/api/photographers');
  console.log('Photographers API status:', photogsRes.status);
  console.log('Photographers data:', photogsRes.data);

  console.log('\n=== 4. Checking JS bundle on site ===');
  const matchBundle = indexRes.data.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (matchBundle) {
    const bundleUrl = 'https://vibenoww.com' + matchBundle[1];
    console.log('Bundle URL:', bundleUrl);
    const bundleRes = await get(bundleUrl);
    console.log('Bundle status:', bundleRes.status);
    console.log('Bundle has 7708320321:', bundleRes.data.includes('7708320321'));
    console.log('Bundle has vibenoww26@gmail.com:', bundleRes.data.includes('vibenoww26@gmail.com'));
    console.log('Bundle has Balabackiya Nagar:', bundleRes.data.toLowerCase().includes('balabackiya'));
    console.log('Bundle has vibenoww-symbol.svg:', bundleRes.data.includes('vibenoww-symbol.svg'));
    console.log('Bundle has 3-dot SVG definition (r:"2.2"):', bundleRes.data.includes('r:"2.2"') && bundleRes.data.includes('mobile-nav-toggle'));
    console.log('Hardcoded mock creators removed:', !bundleRes.data.includes('Alex Rivera') && !bundleRes.data.includes('Priya Sundaram'));
  } else {
    console.log('Bundle script tag not matched directly in index.html');
  }

  console.log('\n=== 5. Checking Editor image replacements ===');
  const editorImg1 = await get('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80');
  console.log('Editor Image 1: status', editorImg1.status);
  const editorImg2 = await get('https://images.unsplash.com/photo-1576836165612-8bc9b07e7778?auto=format&fit=crop&w=800&q=80');
  console.log('Editor Image 2: status', editorImg2.status);
  const editorImg3 = await get('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80');
  console.log('Editor Image 3: status', editorImg3.status);

  console.log('\nALL CHECKS COMPLETE!');
}

verifyAll().catch(console.error);
