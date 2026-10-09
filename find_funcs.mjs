import fs from 'fs';
const s = fs.readFileSync('d:/vn/src/main.js', 'utf8');

const target = '[S,de]=';
const idx = s.indexOf(target);
console.log(s.slice(idx, idx + 2000));
