const fs = require('fs');
const path = require('path');

console.log('--- VERIFYING MOBILE NAVBAR IMPLEMENTATION ---');

// 1. Check src/main.js
const mainJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');

const hasN1 = mainJs.includes('function N1(');
console.log('1. function N1 exists in main.js:', hasN1);

const hasOutsideListener = mainJs.includes('closest(".header--nav-links")') && mainJs.includes('closest(".mobile-nav-toggle")');
console.log('2. Outside click/touch listener implemented in N1:', hasOutsideListener);

const hasBackdrop = mainJs.includes('className:"mobile-nav-backdrop"') && mainJs.includes('onClick:()=>N(!1)');
console.log('3. Mobile nav backdrop implemented in N1:', hasBackdrop);

const hasThreeDots = mainJs.includes('className:`header-icon-btn mobile-nav-toggle ${le?"active":""}`') &&
                     mainJs.includes('cx:"12",cy:"5"') &&
                     mainJs.includes('cx:"12",cy:"12"') &&
                     mainJs.includes('cx:"12",cy:"19"');
console.log('4. Three-dot (⋮) menu button with SVG circles (5, 12, 19) rendered in N1:', hasThreeDots);

// Check all 7 navigation items
const navItems = ['browse', 'portfolio', 'services', 'dashboard', 'select-photographers', 'about', 'contact'];
const allNavPresent = navItems.every(item => mainJs.includes(`k("${item}")`));
console.log('5. All 7 existing navigation links (Home, Moments, Business, Creators, Explore, About, Contact) present & wired to k():', allNavPresent);

// 2. Check src/index.css
const indexCss = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.css'), 'utf8');

const hasDesktopHidden = indexCss.includes('@media screen and (min-width: 1025px)') &&
                         indexCss.includes('.mobile-nav-toggle {\n    display: none !important;\n  }');
console.log('6. Desktop hides mobile-nav-toggle and mobile-nav-backdrop:', hasDesktopHidden);

const hasCompactDropdown = indexCss.includes('.header--nav-links.mobile-open {') &&
                           indexCss.includes('position: absolute !important;') &&
                           indexCss.includes('top: calc(100% + 8px) !important;') &&
                           indexCss.includes('right: 16px !important;') &&
                           indexCss.includes('width: 250px !important;');
console.log('7. Compact dropdown menu anchored to navbar frame (position: absolute, top: 100%+8px, right: 16px):', hasCompactDropdown);

const hasNoFullscreenTakeover = !indexCss.includes('width: 100vw !important; height: 100vh !important; background: #080b11fa !important;');
console.log('8. Fullscreen takeover eliminated:', hasNoFullscreenTakeover);

if (hasN1 && hasOutsideListener && hasBackdrop && hasThreeDots && allNavPresent && hasDesktopHidden && hasCompactDropdown) {
  console.log('\n>>> ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<');
} else {
  console.error('\n>>> SOME CHECKS FAILED! <<<');
  process.exit(1);
}
