const ftp = require('basic-ftp');

async function downloadLogs() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: '123Vibenoww!@',
      port: 21,
      secure: false
    });

    await client.downloadTo('D:/vn/remote_console.log', '/hbuilds/current/nodejs/console.log');
    await client.downloadTo('D:/vn/remote_env.txt', '/hbuilds/current/nodejs/.env');
    await client.downloadTo('D:/vn/remote_env_prod.txt', '/hbuilds/current/nodejs/.env.production');

    console.log('✅ Downloaded successfully');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    client.close();
  }
}

downloadLogs();
