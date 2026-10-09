const ftp = require('basic-ftp');

async function testCombinations() {
  const users = ['u766698539.vibenoww.com', 'u766698539'];
  const secureOptions = [true, false];

  for (const secure of secureOptions) {
    for (const user of users) {
      console.log(`\n--- Testing user: "${user}", secure: ${secure} ---`);
      const client = new ftp.Client();
      client.ftp.verbose = true;
      try {
        await client.access({
          host: '195.35.44.183',
          user: user,
          password: '123Vibenoww!@',
          port: 21,
          secure: secure,
          secureOptions: { rejectUnauthorized: false }
        });
        console.log(`🎉 SUCCESS with user: "${user}", secure: ${secure}!`);
        const list = await client.list();
        console.log('Listing:');
        list.forEach(i => console.log(` - ${i.name}`));
        client.close();
        return;
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
      } finally {
        client.close();
      }
    }
  }
}

testCombinations();
