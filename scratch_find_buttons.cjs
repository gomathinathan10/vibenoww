const fs = require('fs');
const content = fs.readFileSync('src/main.js', 'utf8');

['Book Creative Partner', 'Find My Moment'].forEach(term => {
  console.log(`\n=== Matches for "${term}" ===`);
  let idx = 0;
  let count = 0;
  while ((idx = content.indexOf(term, idx)) !== null && idx !== -1) {
    count++;
    const start = Math.max(0, idx - 180);
    const end = Math.min(content.length, idx + 180);
    console.log(`Match #${count} at ${idx}:`);
    console.log(content.substring(start, end).replace(/\n/g, ' '));
    idx += term.length;
  }
  console.log(`Total for "${term}": ${count}`);
});
