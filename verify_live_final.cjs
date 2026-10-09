async function verifyLive() {
  console.log('=== VERIFYING LIVE VIBENOWW.COM ===');
  
  // 1. Check index.html
  const htmlRes = await fetch('https://vibenoww.com/?t=' + Date.now());
  const html = await htmlRes.text();
  console.log('index.html HTTP status:', htmlRes.status);
  
  const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  console.log('Live Active Script:', scriptMatch ? scriptMatch[1] : 'NONE');

  // 2. Check logo
  const logoRes = await fetch('https://vibenoww.com/images/vibenoww-logo.png?v=2&t=' + Date.now());
  const logoBuf = await logoRes.arrayBuffer();
  console.log('Live Logo Size:', logoBuf.byteLength, 'bytes | HTTP:', logoRes.status);

  // 3. Check JS bundle
  if (scriptMatch) {
    const bundleRes = await fetch('https://vibenoww.com' + scriptMatch[1]);
    const bundleText = await bundleRes.text();
    console.log('Bundle Length:', bundleText.length);
    console.log('✓ Bundle has __vnOpenImageCropper:', bundleText.includes('__vnOpenImageCropper'));
    console.log('✓ Bundle has Crop Creator Profile Photo:', bundleText.includes('Crop Creator Profile Photo'));
    console.log('✓ Bundle has vn-image-crop-modal:', bundleText.includes('vn-image-crop-modal'));
    console.log('✓ Bundle has /images/vibenoww-logo.png?v=2:', bundleText.includes('/images/vibenoww-logo.png?v=2'));
  }

  // 4. Check Health endpoint
  const healthRes = await fetch('https://vibenoww.com/health?t=' + Date.now());
  const healthJson = await healthRes.json();
  console.log('Live Database Status:', healthJson.database);
  console.log('Live Environment:', healthJson.environment);
  console.log('====================================');
}

verifyLive().catch(console.error);
