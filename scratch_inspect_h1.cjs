const fs = require('fs');
const content = fs.readFileSync('scratch_h1_dump.js', 'utf8');

console.log('--- PART 3 (5500 to end) ---');
console.log(content.slice(5500));
