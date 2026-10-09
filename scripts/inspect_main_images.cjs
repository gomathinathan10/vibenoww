const fs = require('fs');

const c = fs.readFileSync('src/main.js', 'utf8');

const targetUrls = [
  'photo-1534528741775-53994a69daeb',
  'photo-1519741497674-611481863552',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1517841905240-472988babdf9',
  'photo-1500648767791-00dcc994a43e',
  'photo-1544005313-94ddf0286df2',
  'photo-1492562080023-ab3db95bfbce'
];

targetUrls.forEach(term => {
  let idx = 0;
  console.log(`\n=================== Matches for ${term} ===================`);
  while ((idx = c.indexOf(term, idx)) !== -1) {
    const start = Math.max(0, idx - 120);
    const end = Math.min(c.length, idx + 120);
    console.log(`[Pos ${idx}]: ...${c.substring(start, end).replace(/\n/g, ' ')}...`);
    idx += term.length;
  }
});
