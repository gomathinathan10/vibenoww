const fs = require('fs');

const code = fs.readFileSync('src/main.js', 'utf8');

// Pos 253460 was where DataProvider began
const start = 253000;
const end = 265000;
fs.writeFileSync('extracted_datacontext.js', code.substring(start, end));
console.log('Wrote 12000 chars around DataContext to extracted_datacontext.js');
