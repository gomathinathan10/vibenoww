import fs from 'fs';
const s = fs.readFileSync('d:/vn/src/main.js', 'utf8');

const target = 'avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb';
let idx = 0;
while ((idx = s.indexOf(target, idx)) !== -1) {
  console.log('Occurrence at index:', idx);
  console.log(s.slice(Math.max(0, idx - 150), idx + 250));
  idx += target.length + 10;
}
