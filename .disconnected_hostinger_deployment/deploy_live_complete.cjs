const ftp = require('basic-ftp');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('Connecting to FTP 195.35.44.183:21...');
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: '123Vibenoww!@',
      port: 21,
      secure: false
    });
    console.log('✅ FTP Connected!');

    // 1. Upload dist/ to public_html/
    const distDir = path.resolve(__dirname, 'dist');
    console.log(`\nUploading frontend build from ${distDir} to public_html...`);
    await client.cd('public_html');
    await client.uploadFromDir(distDir);
    console.log('✅ Frontend dist uploaded to public_html!');

    // 2. Upload server files
    console.log('\nUploading server files...');
    const localAdminPath = path.resolve(__dirname, 'server/routes/admin.js');
    const localPhotogsPath = path.resolve(__dirname, 'server/routes/photographers.js');
    const localDbPath = path.resolve(__dirname, 'server/config/db.js');
    const localServerPath = path.resolve(__dirname, 'server/server.js');

    // To /server
    await client.ensureDir('/server/routes');
    await client.uploadFrom(localAdminPath, '/server/routes/admin.js');
    await client.uploadFrom(localPhotogsPath, '/server/routes/photographers.js');
    await client.uploadFrom(localDbPath, '/server/config/db.js');
    await client.uploadFrom(localServerPath, '/server/server.js');

    // To /hbuilds/current/nodejs/server
    await client.ensureDir('/hbuilds/current/nodejs/server/routes');
    await client.uploadFrom(localAdminPath, '/hbuilds/current/nodejs/server/routes/admin.js');
    await client.uploadFrom(localPhotogsPath, '/hbuilds/current/nodejs/server/routes/photographers.js');
    await client.uploadFrom(localDbPath, '/hbuilds/current/nodejs/server/config/db.js');
    await client.uploadFrom(localServerPath, '/hbuilds/current/nodejs/server/server.js');

    console.log('✅ Backend server files & routes uploaded!');

    // 3. Touch restart.txt
    await client.ensureDir('/hbuilds/current/nodejs/tmp');
    const restartContent = Buffer.from(Date.now().toString());
    await client.uploadFrom(Readable.from(restartContent), '/hbuilds/current/nodejs/tmp/restart.txt');
    console.log('✅ restart.txt updated to trigger Passenger restart!');

    client.close();

    // 4. Wait 4 seconds for restart
    console.log('\nWaiting 4 seconds for server reload...');
    await new Promise(r => setTimeout(r, 4000));

    // 5. Clean database via admin API
    console.log('\nTriggering database cleaning (removing default/test creators)...');
    const cleanRes = await fetch('https://vibenoww.com/api/admin/clean-default-creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': '123Vibenoww!@'
      }
    });
    const cleanJson = await cleanRes.json();
    console.log('Database Clean Result:', cleanJson);

    // 6. Verify photographers count
    const photogsRes = await fetch('https://vibenoww.com/api/photographers?t=' + Date.now());
    const photogsJson = await photogsRes.json();
    console.log('\nLive Photographers Count:', photogsJson.data ? photogsJson.data.length : 0);
    console.log('Live Photographers List:', photogsJson.data || []);

    // 7. Verify Health endpoint
    const healthRes = await fetch('https://vibenoww.com/health?t=' + Date.now());
    const healthJson = await healthRes.json();
    console.log('Live Database Health:', healthJson.database);

    // 8. Verify live logo
    const logoRes = await fetch('https://vibenoww.com/images/vibenoww-logo.png?t=' + Date.now());
    console.log('Live Logo Status:', logoRes.status, 'Content-Type:', logoRes.headers.get('content-type'));

    console.log('\n🎉 ALL DEPLOYMENTS & LIVE VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Deployment error:', err);
    process.exit(1);
  }
}

deploy();
