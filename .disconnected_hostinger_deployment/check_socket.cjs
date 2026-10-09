const net = require('net');

function checkPort(port) {
  return new Promise(resolve => {
    const sock = new net.Socket();
    sock.setTimeout(3000);
    sock.on('connect', () => {
      console.log(`Port ${port}: OPEN`);
      sock.destroy();
      resolve(true);
    });
    sock.on('timeout', () => {
      console.log(`Port ${port}: TIMEOUT (BLOCKED)`);
      sock.destroy();
      resolve(false);
    });
    sock.on('error', err => {
      console.log(`Port ${port}: ERROR (${err.message})`);
      sock.destroy();
      resolve(false);
    });
    sock.connect(port, '195.35.44.183');
  });
}

async function main() {
  await checkPort(21);
  await checkPort(65002);
}

main();
