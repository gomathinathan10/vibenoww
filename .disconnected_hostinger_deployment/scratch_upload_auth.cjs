const ftp = require('basic-ftp');
const path = require('path');
const { Readable } = require('stream');

async function updateAuth() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: '123Vibenoww!@',
      port: 21,
      secure: false
    });
    console.log('✅ FTP Connected');

    await client.uploadFrom('server/routes/auth.js', '/hbuilds/current/nodejs/server/routes/auth.js');
    await client.uploadFrom('server/routes/auth.js', '/server/routes/auth.js');
    console.log('✅ auth.js uploaded');

    // Touch restart.txt
    await client.ensureDir('/hbuilds/current/nodejs/tmp');
    await client.uploadFrom(Readable.from(Buffer.from(Date.now().toString())), '/hbuilds/current/nodejs/tmp/restart.txt');
    console.log('✅ restart.txt touched');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.close();
  }
}

updateAuth();
