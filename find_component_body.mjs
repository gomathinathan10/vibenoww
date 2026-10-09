import fs from 'fs';
const s = fs.readFileSync('d:/vn/src/main.js', 'utf8');

const start = 674000;
const end = 677000;
console.log(s.slice(start, end));
