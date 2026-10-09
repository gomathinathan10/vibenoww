const fs = require('fs');

const origC1 = fs.readFileSync('c1_original.js', 'utf8');

// Let's inspect the exact lines where C1 starts and ends
console.log('Original C1 length:', origC1.length);
console.log('Starts with:', origC1.substring(0, 100));
console.log('Ends with:', origC1.substring(origC1.length - 100));
