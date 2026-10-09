const ftp = require('basic-ftp');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');
const https = require('https');

async function deployServerRoutes() {
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

    const filesToUpload = [
      'server/routes/auth.js',
      'server/routes/photographers.js',
      'server/routes/orders.js',
      'server/routes/users.js',
      'server/routes/quotations.js',
      'server/routes/reviews.js',
      'server/routes/notifications.js',
      'server/routes/sync.js',
      'server/server.js'
    ];

    for (const relPath of filesToUpload) {
      const localFile = path.resolve(__dirname, relPath);
      if (fs.existsSync(localFile)) {
        console.log(`Uploading ${relPath}...`);
        // Upload to /server/routes/...
        const dir = path.posix.dirname('/' + relPath.replace(/\\/g, '/'));
        await client.ensureDir(dir);
        await client.uploadFrom(localFile, '/' + relPath.replace(/\\/g, '/'));

        // Upload to /hbuilds/current/nodejs/server/routes/...
        const hbuildDir = path.posix.dirname('/hbuilds/current/nodejs/' + relPath.replace(/\\/g, '/'));
        await client.ensureDir(hbuildDir);
        await client.uploadFrom(localFile, '/hbuilds/current/nodejs/' + relPath.replace(/\\/g, '/'));
      }
    }

    // Touch restart.txt
    await client.ensureDir('/hbuilds/current/nodejs/tmp');
    const restartContent = Buffer.from(Date.now().toString());
    await client.uploadFrom(Readable.from(restartContent), '/hbuilds/current/nodejs/tmp/restart.txt');
    console.log('✅ restart.txt updated to trigger Passenger restart!');

    client.close();

    console.log('\nWaiting 4 seconds for Passenger to restart...');
    await new Promise(r => setTimeout(r, 4000));

    // Call DELETE /api/photographers/all-creators
    console.log('Calling DELETE https://vibenoww.com/api/photographers/all-creators ...');
    const deleteReq = https.request('https://vibenoww.com/api/photographers/all-creators', {
      method: 'DELETE'
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        console.log('DELETE response:', data);

        // Verify GET /api/photographers
        https.get('https://vibenoww.com/api/photographers', (res2) => {
          let data2 = '';
          res2.on('data', d => data2 += d);
          res2.on('end', () => {
            console.log('\nGET /api/photographers verification:');
            console.log(data2);
          });
        });
      });
    });
    deleteReq.on('error', err => console.error('DELETE error:', err.message));
    deleteReq.end();

  } catch (err) {
    console.error('❌ FTP Error:', err);
    client.close();
  }
}

deployServerRoutes();
