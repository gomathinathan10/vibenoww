const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { Readable } = require('stream');

async function deployAll() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('📡 Connecting to Hostinger FTP (195.35.44.183:21)...');
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: '123Vibenoww!@',
      port: 21,
      secure: false
    });
    console.log('✅ FTP Connected!');

    // 1. Upload dist to /public_html
    const distDir = path.resolve(__dirname, 'dist');
    console.log(`\n🚀 Uploading dist/ to /public_html ...`);
    await client.ensureDir('/public_html');
    await client.uploadFromDir(distDir, '/public_html');
    console.log('✅ dist/ uploaded to /public_html!');

    // 2. Upload dist to /hbuilds/current/nodejs/dist
    console.log(`\n🚀 Uploading dist/ to /hbuilds/current/nodejs/dist ...`);
    await client.ensureDir('/hbuilds/current/nodejs/dist');
    await client.uploadFromDir(distDir, '/hbuilds/current/nodejs/dist');
    console.log('✅ dist/ uploaded to /hbuilds/current/nodejs/dist!');

    // 3. Upload server files to /hbuilds/current/nodejs/server
    const serverDir = path.resolve(__dirname, 'server');
    console.log(`\n🚀 Uploading server/ to /hbuilds/current/nodejs/server ...`);
    await client.ensureDir('/hbuilds/current/nodejs/server');
    await client.uploadFromDir(serverDir, '/hbuilds/current/nodejs/server');
    console.log('✅ server/ uploaded to /hbuilds/current/nodejs/server!');

    // 4. Upload server files to /server
    console.log(`\n🚀 Uploading server/ to /server ...`);
    await client.ensureDir('/server');
    await client.uploadFromDir(serverDir, '/server');
    console.log('✅ server/ uploaded to /server!');

    // 4b. Ensure upload directories exist
    console.log(`\n📁 Ensuring uploads/creators directories on Hostinger...`);
    await client.ensureDir('/public_html/uploads/creators');
    await client.ensureDir('/hbuilds/current/nodejs/uploads/creators');
    await client.ensureDir('/uploads/creators');
    const localUploadsDir = path.resolve(__dirname, 'uploads');
    if (fs.existsSync(localUploadsDir)) {
      await client.uploadFromDir(localUploadsDir, '/public_html/uploads');
      await client.uploadFromDir(localUploadsDir, '/hbuilds/current/nodejs/uploads');
    }
    console.log('✅ Upload directories verified on Hostinger!');

    // 5. Upload environment files
    const envProd = path.resolve(__dirname, '.env.production');
    if (fs.existsSync(envProd)) {
      console.log('\n📄 Uploading .env files...');
      await client.uploadFrom(envProd, '/hbuilds/current/nodejs/.env');
      await client.uploadFrom(envProd, '/hbuilds/current/nodejs/.env.production');
      await client.uploadFrom(envProd, '/.env');
      await client.uploadFrom(envProd, '/.env.production');
      console.log('✅ .env files uploaded!');
    }

    // 6. Touch restart.txt
    console.log('\n🔄 Triggering Passenger restart via restart.txt...');
    await client.ensureDir('/hbuilds/current/nodejs/tmp');
    const restartContent = Buffer.from(Date.now().toString());
    await client.uploadFrom(Readable.from(restartContent), '/hbuilds/current/nodejs/tmp/restart.txt');
    console.log('✅ restart.txt touched!');

    client.close();
    console.log('\n🎉 FTP Deployment complete!');

    // 7. Verify health
    console.log('\n⏳ Waiting 4 seconds for Passenger to reload...');
    await new Promise(r => setTimeout(r, 4000));

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
    console.error('❌ Deployment error:', err);
    client.close();
    process.exit(1);
  }
}

deployAll();
