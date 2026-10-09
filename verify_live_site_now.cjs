async function verify() {
  const htmlRes = await fetch('https://vibenoww.com/?t=' + Date.now());
  const html = await htmlRes.text();
  const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  const cssMatch = html.match(/href="(\/assets\/index-[^"]+\.css)"/);
  console.log('HTML status:', htmlRes.status);
  console.log('Active JS Bundle:', scriptMatch ? scriptMatch[1] : 'NONE');
  console.log('Active CSS:', cssMatch ? cssMatch[1] : 'NONE');

  if (scriptMatch) {
    const jsRes = await fetch('https://vibenoww.com' + scriptMatch[1]);
    const js = await jsRes.text();
    console.log('Bundle size:', js.length);
    console.log('✓ Has sticky submit button text:', js.includes('Submit Cropped Photo'));
    console.log('✓ Has opaque crop modal background:', js.includes('rgba(3, 6, 16, 0.98)') || js.includes('rgba(3,6,16,0.98)'));
    console.log('✓ Has __vnOpenImageCropper:', js.includes('__vnOpenImageCropper'));
  }

  const logoRes = await fetch('https://vibenoww.com/images/vibenoww-logo.png?t=' + Date.now());
  const logoBuf = await logoRes.arrayBuffer();
  console.log('✓ Logo status:', logoRes.status, 'size:', logoBuf.byteLength, 'bytes');

  const photogsRes = await fetch('https://vibenoww.com/api/photographers?t=' + Date.now());
  const photogs = await photogsRes.json();
  console.log('✓ Live Photographers Count:', photogs.data ? photogs.data.length : 0);
  console.log('✓ Live Photographers List:', photogs.data);

  const healthRes = await fetch('https://vibenoww.com/health?t=' + Date.now());
  const health = await healthRes.json();
  console.log('✓ Database health:', health.database);
}

verify().catch(console.error);
