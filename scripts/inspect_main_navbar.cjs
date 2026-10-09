const fs = require('fs');

const mainContent = fs.readFileSync('src/main.js', 'utf8');
console.log('=== main.js around 281500 to 286000 ===');
console.log(mainContent.substring(281500, 286000));
