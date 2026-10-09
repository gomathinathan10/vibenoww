import fs from 'fs';
const s = fs.readFileSync('d:/vn/src/main.js', 'utf8');

const haldiIdx = s.indexOf('Beach Haldi');
console.log(s.slice(haldiIdx - 1000, haldiIdx));
