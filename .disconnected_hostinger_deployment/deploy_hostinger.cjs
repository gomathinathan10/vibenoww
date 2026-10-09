const ftp = require('basic-ftp');
const path = require('path');
const https = require('https');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  
  const distDir = path.resolve(__dirname, 'dist');
  console.log(`🚀 Starting deployment from local: ${distDir}`);
  console.log(`Connecting to Hostinger FTP (195.35.44.183:21)...`);
  
  try {
    await client.access({
      host: '195.35.44.183',
      user: 'u766698539.vibenoww.com',
      password: '123Vibenoww!@',
      port: 21,
      secure: false
    });
    
    console.log('✅ FTP Connected successfully!');
    
    // Ensure we are in public_html
    console.log('Navigating to remote directory: public_html...');
    await client.cd('public_html');
    console.log('Current remote directory: ' + await client.pwd());
    
    // Upload the entire contents of dist to public_html
    console.log('Uploading all dist/ files to public_html/ ...');
    await client.uploadFromDir(distDir);
    
    console.log('🎉 All files uploaded successfully!');
    
  } catch (err) {
    console.error('❌ Deployment error:', err.message || err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
