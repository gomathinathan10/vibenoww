const ftp = require('basic-ftp');

const passwords = [
  '123Vibenoww!@',
  '123Vibenoww!@ ',
  '123vibenoww!@',
  '123VibeNoww!@',
  '123Vibenoww!',
  '123Vibenoww@',
  'Vibenoww123!@',
  '123Vibenoww',
  'vibenoww123!@'
];

async function tryPass(pwd) {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: pwd,
      port: 21
    });
    console.log(`🎉 SUCCESS! Password is: "${pwd}"`);
    return true;
  } catch (e) {
    console.log(`Failed with "${pwd}": ${e.message}`);
    return false;
  } finally {
    client.close();
  }
}

async function run() {
  for (const p of passwords) {
    if (await tryPass(p)) break;
  }
}

run();
