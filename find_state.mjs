import fs from 'fs';
const s = fs.readFileSync('d:/vn/src/main.js', 'utf8');

const target = '[N,C]=(0,w.useState)({title:"",url:""})';
const idx = s.indexOf(target);
console.log('Target index:', idx);
console.log('--- 600 chars before ---');
console.log(s.slice(idx - 600, idx));
console.log('--- 800 chars after ---');
console.log(s.slice(idx, idx + 800));
