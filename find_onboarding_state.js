const fs = require('fs');
const s = fs.readFileSync('d:/vn/src/main.js', 'utf8');

const haldiIdx = s.indexOf('Beach Haldi');
const addFuncIdx = s.indexOf('Image URL (https://images.unsplash.com');

console.log('Haldi index:', haldiIdx);
console.log('Add input index:', addFuncIdx);

// Look backwards from haldiIdx to find the component setup
const before = s.slice(Math.max(0, haldiIdx - 20000), haldiIdx);

// Find all occurrences of avatar in before
let idx = 0;
while ((idx = before.indexOf('avatar', idx)) !== -1) {
  console.log('avatar at', idx, ':', before.slice(Math.max(0, idx - 40), idx + 80));
  idx += 10;
}

// Find all occurrences of 'Beach' or 'p1' or 'p2' or 'p3' or portfolio state
['p1', 'p2', 'p3', 'p4', 'portfolio'].forEach(key => {
  let kIdx = 0;
  while ((kIdx = before.indexOf(key, kIdx)) !== -1) {
    console.log(key, 'at', kIdx, ':', before.slice(Math.max(0, kIdx - 30), kIdx + 70));
    kIdx += key.length + 5;
  }
});
