const https = require('https');

https.get('https://vibenoww.com/', res => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const scriptMatch = html.match(/\/assets\/index-[^"]+\.js/);
    console.log('Script tag in HTML:', scriptMatch ? scriptMatch[0] : 'None');

    if (scriptMatch) {
      https.get('https://vibenoww.com' + scriptMatch[0], jsRes => {
        let js = '';
        jsRes.on('data', d => js += d);
        jsRes.on('end', () => {
          console.log('JS bundle length:', js.length);
          console.log('Contains "Upload Portfolio Photos from Device / System":', js.includes('Upload Portfolio Photos from Device / System'));
          console.log('Contains "creatorPortfolioUploadFiles":', js.includes('creatorPortfolioUploadFiles'));
          console.log('Contains "Photo Uploaded ✓":', js.includes('Photo Uploaded ✓'));
          console.log('Contains "Royal Tamil Wedding" (should be false):', js.includes('Royal Tamil Wedding'));
          console.log('Contains "Sunset Couple Portrait" (should be false):', js.includes('Sunset Couple Portrait'));
        });
      });
    }
  });
});
