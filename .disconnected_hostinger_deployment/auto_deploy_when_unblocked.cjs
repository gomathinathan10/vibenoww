const ftp = require('basic-ftp');
const net = require('net');
const path = require('path');
const https = require('https');

const HOST = '195.35.44.183';
const USER = 'u766698539.vibenoww.com';
const PASS = '123Hema!@#';
const DIST_DIR = path.resolve(__dirname, 'dist');

function checkPort(port = 21, timeout = 3000) {
  return new Promise(resolve => {
    const s = new net.Socket();
    s.setTimeout(timeout);
    s.on('connect', () => { s.destroy(); resolve(true); });
    s.on('timeout', () => { s.destroy(); resolve(false); });
    s.on('error', () => { s.destroy(); resolve(false); });
    s.connect(port, HOST);
  });
}

async function doDeploy() {
  console.log('\n========================================');
  console.log('🚀 Port is reachable! Attempting deployment...');
  console.log('Connecting with username:', USER);
  
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: HOST,
      user: USER,
      password: PASS,
      port: 21,
      secure: false
    });
    console.log('🎉 FTP CONNECTED SUCCESSFULLY!');
    
    // Check remote folders
    const rootList = await client.list();
    console.log('Remote root directories:', rootList.map(i => i.name).join(', '));
    
    // Upload into public_html
    console.log('Navigating to public_html...');
    await client.cd('public_html');
    console.log('Uploading dist files to public_html/ ...');
    await client.uploadFromDir(DIST_DIR);
    console.log('✅ Uploaded to public_html/');
    
    // Also check if there is a dist folder inside or parallel
    try {
      await client.cdUp();
      const hasDist = rootList.some(i => i.name === 'dist');
      if (hasDist) {
        console.log('Updating remote dist/ directory...');
        await client.cd('dist');
        await client.uploadFromDir(DIST_DIR);
        console.log('✅ Updated remote dist/ directory!');
      }
    } catch (e) {
      console.log('dist upload note:', e.message);
    }
    
    // Check tmp/restart.txt for Phusion Passenger / Hostinger Node.js
    try {
      await client.cd('/');
      await client.ensureDir('tmp');
      await client.cd('tmp');
      const restartBuffer = Buffer.from(Date.now().toString());
      const { Readable } = require('stream');
      await client.uploadFrom(Readable.from(restartBuffer), 'restart.txt');
      console.log('✅ Created tmp/restart.txt to trigger Node.js restart!');
    } catch (e) {
      console.log('tmp/restart.txt note:', e.message);
    }

    console.log('\n🎉 ALL FILES DEPLOYED TO HOSTINGER!');
    
    // Verify live site
    setTimeout(() => {
      https.get('https://vibenoww.com/?t=' + Date.now(), res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          const match = body.match(/index-[^"]+\.js/);
          console.log('\n========================================');
          console.log('🌐 LIVE SITE VERIFICATION:');
          console.log('Status code:', res.statusCode);
          console.log('Active JS bundle:', match ? match[0] : 'not found');
          if (match && match[0].includes('Btv7UoFT')) {
            console.log('🏆 SUCCESS! New build is now officially LIVE on vibenoww.com!');
          } else {
            console.log('ℹ️ Note: Restart Node.js in Hostinger hPanel to load new bundle.');
          }
        });
      });
    }, 2000);

    return true;
  } catch (err) {
    console.error('❌ FTP Deployment failed:', err.message);
    return false;
  } finally {
    client.close();
  }
}

async function loop() {
  console.log('👀 Monitoring Hostinger firewall for port 21 unblock...');
  let attempts = 0;
  while (attempts < 60) {
    attempts++;
    const isOpen = await checkPort(21, 3000);
    if (isOpen) {
      console.log(`Port 21 is OPEN on check #${attempts}!`);
      const ok = await doDeploy();
      if (ok) process.exit(0);
    } else {
      process.stdout.write('.');
    }
    await new Promise(r => setTimeout(r, 10000));
  }
  console.log('\nTimed out waiting for unblock.');
  process.exit(1);
}

loop();
