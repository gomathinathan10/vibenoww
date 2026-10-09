const fs = require('fs');

const files = [
  'src/main.js',
  'server/routes/photographers.js',
  'server/routes/auth.js',
  'server/routes/creators.js',
  'server/config/db.js'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const c = fs.readFileSync(f, 'utf8');
  const m = [...c.matchAll(/https:\/\/images\.unsplash\.com[^\s"\'\`\)]+/g)];
  if (m.length > 0) {
    const unique = [...new Set(m.map(x => x[0]))];
    console.log(`\n=== ${f} (${m.length} occurrences, ${unique.length} unique) ===`);
    unique.forEach(u => console.log('  ', u));
  }
});
