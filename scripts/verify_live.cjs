const https = require('https');

https.get('https://vibenoww.com', (res) => {
  console.log('Live Homepage Status Code:', res.statusCode);
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTML size:', html.length, 'bytes');
    const cssMatch = html.match(/\/assets\/index-[^"']+\.css/);
    const jsMatch = html.match(/\/assets\/index-[^"']+\.js/);
    console.log('Live CSS link:', cssMatch ? cssMatch[0] : 'None');
    console.log('Live JS link:', jsMatch ? jsMatch[0] : 'None');

    if (cssMatch) {
      https.get('https://vibenoww.com' + cssMatch[0], (cssRes) => {
        let css = '';
        cssRes.on('data', chunk => css += chunk);
        cssRes.on('end', () => {
          console.log('\n--- LIVE CSS VERIFICATION ---');
          console.log('CSS HTTP Status:', cssRes.statusCode);
          console.log('Contains mobileCompactMenuPop:', css.includes('mobileCompactMenuPop'));
          console.log('Contains mobile-nav-backdrop:', css.includes('mobile-nav-backdrop'));
          console.log('Contains top: calc(100% + 8px):', css.includes('top:calc(100% + 8px)') || css.includes('top: calc(100% + 8px)'));
        });
      });
    }

    if (jsMatch) {
      https.get('https://vibenoww.com' + jsMatch[0], (jsRes) => {
        let js = '';
        jsRes.on('data', chunk => js += chunk);
        jsRes.on('end', () => {
          console.log('\n--- LIVE JS VERIFICATION ---');
          console.log('JS HTTP Status:', jsRes.statusCode);
          console.log('Contains mobile-nav-backdrop:', js.includes('mobile-nav-backdrop'));
          console.log('Contains closest(".header--nav-links"):', js.includes('closest(".header--nav-links")'));
          console.log('Contains Three-dot circles (cx:12, cy:5/12/19):', js.includes('cx:"12",cy:"5"') && js.includes('cx:"12",cy:"19"'));
        });
      });
    }
  });
}).on('error', err => console.error(err));
