import fs from 'fs';
const s = fs.readFileSync('d:/vn/src/main.js', 'utf8');

const target = 'avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb';
const idx = s.indexOf(target);
console.log('Target index in main.js:', idx);
console.log('--- 300 chars before ---');
console.log(s.slice(idx - 300, idx));
console.log('--- 700 chars after ---');
console.log(s.slice(idx, idx + 700));
