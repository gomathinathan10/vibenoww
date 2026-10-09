const fs = require('fs');

const code = fs.readFileSync('src/main.js', 'utf8');

const start = 270000;
const end = 280000;
fs.writeFileSync('extracted_datacontext_3.js', code.substring(start, end));
console.log('Wrote extracted_datacontext_3.js');
