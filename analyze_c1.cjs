const fs = require('fs');

const c1 = fs.readFileSync('c1_original.js', 'utf8');

// Let's print the return statement of C1
const returnIdx = c1.lastIndexOf('return(0,r.jsx)(lg.Provider');
console.log('Return statement at:', returnIdx);
console.log('Return value snippet:\n', c1.substring(returnIdx, returnIdx + 1500));
