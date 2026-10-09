const fs = require('fs');

const code = fs.readFileSync('src/main.js', 'utf8');

const fnStartStr = 'function C1({children:u}){';
const fnStart = code.indexOf(fnStartStr);

const fnEndStr = 'function rr(){let u=(0,w.useContext)(lg);';
const fnEnd = code.indexOf(fnEndStr);

console.log('fnStart:', fnStart);
console.log('fnEnd:', fnEnd);
console.log('Length of C1:', fnEnd - fnStart);

fs.writeFileSync('c1_original.js', code.substring(fnStart, fnEnd));
console.log('Wrote c1_original.js');
