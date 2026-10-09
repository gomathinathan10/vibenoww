const ftp = require('basic-ftp');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');
const https = require('https');

async function deployServer() {
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

    // 1. Upload server/config/db.js and server/server.js
    console.log('\nUploading server files...');
    const localDbPath = path.resolve(__dirname, 'server/config/db.js');
    const localServerPath = path.resolve(__dirname, 'server/server.js');
    const localEnvProd = path.resolve(__dirname, '.env.production');

    const localPhotogsPath = path.resolve(__dirname, 'server/routes/photographers.js');
    const localAuthPath = path.resolve(__dirname, 'server/routes/auth.js');

    // To /server
    await client.ensureDir('/server/config');
    await client.uploadFrom(localDbPath, '/server/config/db.js');
    await client.uploadFrom(localServerPath, '/server/server.js');
    await client.ensureDir('/server/routes');
    await client.uploadFrom(localPhotogsPath, '/server/routes/photographers.js');
    await client.uploadFrom(localAuthPath, '/server/routes/auth.js');

    // To /hbuilds/current/nodejs/server
    await client.ensureDir('/hbuilds/current/nodejs/server/config');
    await client.uploadFrom(localDbPath, '/hbuilds/current/nodejs/server/config/db.js');
    await client.uploadFrom(localServerPath, '/hbuilds/current/nodejs/server/server.js');
    await client.ensureDir('/hbuilds/current/nodejs/server/routes');
    await client.uploadFrom(localPhotogsPath, '/hbuilds/current/nodejs/server/routes/photographers.js');
    await client.uploadFrom(localAuthPath, '/hbuilds/current/nodejs/server/routes/auth.js');

    // To /hbuilds/current/nodejs/.env and .env.production
    await client.uploadFrom(localEnvProd, '/hbuilds/current/nodejs/.env');
    await client.uploadFrom(localEnvProd, '/hbuilds/current/nodejs/.env.production');

    console.log('✅ Server files, routes, and env uploaded!');

    // 2. Touch restart.txt
    await client.ensureDir('/hbuilds/current/nodejs/tmp');
    const restartContent = Buffer.from(Date.now().toString());
    await client.uploadFrom(Readable.from(restartContent), '/hbuilds/current/nodejs/tmp/restart.txt');
    console.log('✅ restart.txt updated to trigger Passenger restart!');

    client.close();

    // 3. Query health endpoint
    console.log('\nWaiting 3 seconds for server to reload...');
    await new Promise(r => setTimeout(r, 3000));

    https.get('https://vibenoww.com/health?t=' + Date.now(), res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        console.log('\n========================================');
        console.log('Live /health response:');
        console.log(data);
        console.log('========================================');
      });
    }).on('error', err => {
      console.error('Error fetching /health:', err.message);
    });

  } catch (err) {
    console.error('❌ FTP Error:', err);
    client.close();
  }
}

deployServer();
