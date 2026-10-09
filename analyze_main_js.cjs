const fs = require('fs');

const code = fs.readFileSync('src/main.js', 'utf8');
console.log('Total length of src/main.js:', code.length);

function findMatches(keyword, contextLength = 200, maxResults = 5) {
  console.log(`\n=================== Matches for "${keyword}" ===================`);
  let idx = 0;
  let count = 0;
  while ((idx = code.indexOf(keyword, idx)) !== -1 && count < maxResults) {
    const start = Math.max(0, idx - 50);
    const end = Math.min(code.length, idx + keyword.length + contextLength);
    console.log(`[Pos ${idx}]: ...${code.substring(start, end).replace(/\n/g, ' ')}...`);
    idx += keyword.length;
    count++;
  }
}

findMatches('/api/photographers');
findMatches('/api/orders');
findMatches('/api/auth');
findMatches('Join as Creator');
findMatches('Join as VibeNoww Creator');
findMatches('localStorage');
