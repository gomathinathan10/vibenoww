const ftp = require('basic-ftp');

async function testConnection(user, secure) {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    console.log(`\n========================================`);
    console.log(`Testing FTP: User=${user}, Secure=${secure}`);
    await client.access({
      host: '195.35.44.183',
      user: user,
      password: '123Vibenoww!@',
      port: 21,
      secure: secure,
      secureOptions: { rejectUnauthorized: false }
    });
    console.log('✅ FTP Connected successfully!');
    const list = await client.list();
    console.log('Remote root directory contents:');
    for (const item of list) {
      console.log(` - [${item.isDirectory ? 'DIR' : 'FILE'}] ${item.name} (${item.size} bytes)`);
    }
    return true;
  } catch (err) {
    console.error(`❌ FTP Error for ${user} (secure=${secure}):`, err.message || err);
    return false;
  } finally {
    client.close();
  }
}

async function run() {
  const users = ['u766698539.vibenoww.com', 'u766698539'];
  for (const user of users) {
    const success = await testConnection(user, false);
    if (success) return;
    const successTls = await testConnection(user, true);
    if (successTls) return;
  }
}

run();
