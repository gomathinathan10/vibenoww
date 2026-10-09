const { Client } = require('ssh2');

async function testSSH(username, port = 65002) {
  return new Promise((resolve) => {
    console.log(`\nTesting SSH/SFTP: host=195.35.44.183, port=${port}, username=${username}`);
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`✅ SSH Connected successfully for ${username}!`);
      conn.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP error:', err);
          conn.end();
          resolve(false);
          return;
        }
        console.log('✅ SFTP session opened!');
        sftp.readdir('.', (err, list) => {
          if (err) {
            console.error('Readdir error:', err);
          } else {
            console.log('Directory contents:');
            list.forEach(item => console.log(' - ' + item.filename));
          }
          conn.end();
          resolve(true);
        });
      });
    }).on('error', (err) => {
      console.error(`❌ SSH Error for ${username}:`, err.message);
      resolve(false);
    }).connect({
      host: '195.35.44.183',
      port: port,
      username: username,
      password: '123Vibenoww!@',
      readyTimeout: 10000
    });
  });
}

async function run() {
  const users = ['u766698539', 'u766698539.vibenoww.com', 'root', 'vibenoww'];
  for (const u of users) {
    const ok = await testSSH(u, 65002);
    if (ok) return;
  }
  // Also try standard port 22 just in case
  for (const u of ['u766698539', 'u766698539.vibenoww.com']) {
    const ok = await testSSH(u, 22);
    if (ok) return;
  }
}

run();
