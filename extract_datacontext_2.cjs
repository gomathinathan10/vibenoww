const fs = require('fs');

const code = fs.readFileSync('src/main.js', 'utf8');

const start = 258000;
const end = 275000;
fs.writeFileSync('extracted_datacontext_2.js', code.substring(start, end));
console.log('Wrote extracted_datacontext_2.js');
