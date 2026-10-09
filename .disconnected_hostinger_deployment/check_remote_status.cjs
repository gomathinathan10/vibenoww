const ftp = require('basic-ftp');
const { Readable } = require('stream');

async function checkRemote() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: '123Vibenoww!@',
      port: 21,
      secure: false
    });
    console.log('✅ FTP connection successful!');

    console.log('\n--- Checking /hbuilds/config/.env ---');
    try {
      await client.downloadTo('D:/vn/cfg_env_current.txt', '/hbuilds/config/.env');
      console.log('Remote /hbuilds/config/.env content:');
      console.log(require('fs').readFileSync('D:/vn/cfg_env_current.txt', 'utf8'));
    } catch (e) {
      console.log('Error reading /hbuilds/config/.env:', e.message);
    }

    console.log('\n--- Checking /hbuilds/current/nodejs/ ---');
    try {
      const nodejsList = await client.list('/hbuilds/current/nodejs');
      console.log('Files in /hbuilds/current/nodejs:');
      nodejsList.forEach(f => console.log(` - ${f.name} (${f.isDirectory ? 'DIR' : f.size + ' B'})`));
    } catch (e) {
      console.log('Error listing /hbuilds/current/nodejs:', e.message);
    }

    console.log('\n--- Touching /hbuilds/current/nodejs/tmp/restart.txt ---');
    try {
      await client.ensureDir('/hbuilds/current/nodejs/tmp');
      const timeStr = Buffer.from(Date.now().toString());
      await client.uploadFrom(Readable.from(timeStr), '/hbuilds/current/nodejs/tmp/restart.txt');
      console.log('✅ Uploaded restart.txt to /hbuilds/current/nodejs/tmp/restart.txt');
    } catch (e) {
      console.log('Error uploading restart.txt:', e.message);
    }

    console.log('\n--- Touching /tmp/restart.txt in root if applicable ---');
    try {
      await client.ensureDir('/tmp');
      const timeStr = Buffer.from(Date.now().toString());
      await client.uploadFrom(Readable.from(timeStr), '/tmp/restart.txt');
      console.log('✅ Uploaded /tmp/restart.txt');
    } catch (e) {}

  } catch (err) {
    console.error('❌ FTP Error:', err);
  } finally {
    client.close();
  }
}

checkRemote();
