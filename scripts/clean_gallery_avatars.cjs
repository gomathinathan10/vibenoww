const fs = require('fs');

let content = fs.readFileSync('src/main.js', 'utf8');

// 1. Replace Karthik Raja fallback in orders table
content = content.replace('Y.assignedPhotographerName||"Karthik Raja (Studio Lead)"', 'Y.assignedPhotographerName||"Assigned Creator"');

// 2. Clear demo Unsplash creatorAvatars in the static gallery items
content = content.replace(/creatorAvatar:"https:\/\/images\.unsplash\.com\/photo-[^"]+"/g, 'creatorAvatar:""');

try {
  new Function(content);
  console.log('✅ Syntax valid after cleanup!');
  fs.writeFileSync('src/main.js', content, 'utf8');
} catch (e) {
  console.error('❌ Syntax error:', e.message);
  process.exit(1);
}
