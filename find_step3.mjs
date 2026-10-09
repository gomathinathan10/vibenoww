import fs from 'fs';
const s = fs.readFileSync('d:/vn/src/main.js', 'utf8');

const haldiIdx = s.indexOf('Beach Haldi');
// Print from 400 chars before haldiIdx to 1800 chars after
console.log(s.slice(haldiIdx - 400, haldiIdx + 2200));
