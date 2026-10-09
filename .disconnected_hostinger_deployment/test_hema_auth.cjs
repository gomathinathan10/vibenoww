const ftp = require('basic-ftp');
const { Client } = require('ssh2');

const HOST = '195.35.44.183';
const USER = 'u766698539.vibenoww.com';
const USER_SSH = 'u766698539';
const PASS = '123Hema!@#';

async function testFTP() {
  console.log('Testing FTP with password...');
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: HOST,
      user: USER,
      password: PASS,
      port: 21,
      secure: false
    });
    console.log('🎉 FTP SUCCESS! Connected to Hostinger!');
    const list = await client.list();
    console.log('Files:');
    list.forEach(f => console.log(' - ' + f.name));
    return true;
  } catch (err) {
    console.log('FTP failed:', err.message);
    return false;
  } finally {
    client.close();
  }
}

async function testSSH() {
  console.log('\nTesting SSH/SFTP on port 65002...');
  return new Promise(resolve => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('🎉 SSH/SFTP SUCCESS! Connected on 65002!');
      conn.sftp((err, sftp) => {
        if (err) {
          console.log('SFTP session err:', err.message);
          conn.end();
          resolve(false);
          return;
        }
        sftp.readdir('.', (err, list) => {
          if (!err) {
            console.log('SFTP files:');
            list.forEach(i => console.log(' - ' + i.filename));
          }
          conn.end();
          resolve(true);
        });
      });
    }).on('error', err => {
      console.log('SSH failed:', err.message);
      resolve(false);
    }).connect({
      host: HOST,
      port: 65002,
      username: USER_SSH,
      password: PASS,
      readyTimeout: 10000
    });
  });
}

async function run() {
  const ftpOk = await testFTP();
  if (!ftpOk) {
    await testSSH();
  }
}

run();
