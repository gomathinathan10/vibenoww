const ftp = require('basic-ftp');

async function downloadRemoteFiles() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: '123Vibenoww!@',
      port: 21,
      secure: false
    });

    await client.downloadTo('D:/vn/remote_db.js', '/hbuilds/current/nodejs/server/config/db.js');
    await client.downloadTo('D:/vn/remote_server.js', '/hbuilds/current/nodejs/server/server.js');
    console.log('Downloaded remote server files');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    client.close();
  }
}

downloadRemoteFiles();
