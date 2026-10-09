const fs = require('fs');

console.log('--- Inspecting src/components/Navbar.jsx ---');
if (fs.existsSync('src/components/Navbar.jsx')) {
  const navContent = fs.readFileSync('src/components/Navbar.jsx', 'utf8');
  console.log('Navbar.jsx length:', navContent.length);
  console.log(navContent.substring(0, 1500));
}

console.log('\n--- Inspecting src/main.js for Navbar / Header ---');
const mainContent = fs.readFileSync('src/main.js', 'utf8');

// Search for header or nav tags or nav items
const searchTerms = ['className:"nav', 'className:"header', '<header', '<nav', 'vibenoww-logo', 'activeTab'];
searchTerms.forEach(term => {
  let idx = 0;
  let matches = [];
  while ((idx = mainContent.indexOf(term, idx)) !== -1) {
    matches.push(idx);
    idx += term.length;
  }
  console.log(`Term "${term}": ${matches.length} matches at`, matches.slice(0, 5));
});
