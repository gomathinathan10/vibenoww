const ftp = require('basic-ftp');

async function search() {
  const client = new ftp.Client();
  try {
    await client.access({ host: '195.35.44.183', user: 'u766698539.vibenoww.com', password: '123Vibenoww!@', port: 21, secure: false });

    // Check /hbuilds/config/
    const cfgList = await client.list('/hbuilds/config');
    console.log('/hbuilds/config files:');
    cfgList.forEach(i => console.log(' - ' + i.name));

    for (const f of cfgList) {
      if (!f.isDirectory) {
        await client.downloadTo('D:/vn/cfg_' + f.name, '/hbuilds/config/' + f.name);
        console.log(`Contents of ${f.name}:`);
        console.log(require('fs').readFileSync('D:/vn/cfg_' + f.name, 'utf8'));
      }
    }

  } finally {
    client.close();
  }
}

search();
