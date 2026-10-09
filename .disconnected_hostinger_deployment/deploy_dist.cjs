const ftp = require('basic-ftp');
const path = require('path');

async function deployDist() {
  const client = new ftp.Client();
  try {
    console.log('Connecting to Hostinger FTP...');
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: '123Vibenoww!@',
      port: 21,
      secure: false
    });
    console.log('✅ FTP Connected!');

    const distDir = path.resolve(__dirname, '../dist');
    console.log('Uploading dist/ to /public_html ...');
    await client.ensureDir('/public_html');
    await client.uploadFromDir(distDir, '/public_html');

    console.log('Uploading dist/ to /hbuilds/current/nodejs/dist ...');
    await client.ensureDir('/hbuilds/current/nodejs/dist');
    await client.uploadFromDir(distDir, '/hbuilds/current/nodejs/dist');

    console.log('✅ dist deployed successfully!');
    client.close();
  } catch (e) {
    console.error('Error:', e);
    client.close();
    process.exit(1);
  }
}

deployDist();
