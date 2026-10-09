const fs = require('fs');
const content = fs.readFileSync('src/main.js', 'utf8');

function findTab(tabName) {
  const needle = `he==="${tabName}"`;
  const idx = content.indexOf(needle);
  console.log(`\n=================== TAB: ${tabName} (index ${idx}) ===================`);
  if (idx !== -1) {
    console.log(content.slice(idx, idx + 2000));
  }
}

findTab('photographers');
findTab('verification');
