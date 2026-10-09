import fs from 'fs';

// 1. Update src/bundle.js
let bundle = fs.readFileSync('src/bundle.js', 'utf8');

// A. Replace "Email / Photographer ID" label with "Mobile Number"
bundle = bundle.replace(/children:`Email \/ Photographer ID`/g, 'children:`Mobile Number`');
bundle = bundle.replace(/Email \/ Photographer ID/g, 'Mobile Number');

// B. Replace placeholder "e.g. karthik or karthik@vibenow.com" with "Enter 10-digit mobile number"
bundle = bundle.replace(/placeholder:`e\.g\. karthik or karthik@vibenow\.com`/g, 'placeholder:`Enter 10-digit mobile number`,type:`tel`');
bundle = bundle.replace(/e\.g\. karthik or karthik@vibenow\.com/g, 'Enter 10-digit mobile number');

// C. Replace password placeholder "Password (Default: 123)" with "Enter your password"
bundle = bundle.replace(/placeholder:`Password \(Default: 123\)`/g, 'placeholder:`Enter your password`');
bundle = bundle.replace(/Password \(Default: 123\)/g, 'Enter your password');

// D. Remove the Quick Test Accounts section completely
const quickTestPattern = /\(0,H\.jsxs\)\(`div`,{style:{background:`#202020`,padding:`10px 12px`,borderRadius:`8px`,border:`1px solid #2a2a2a`,marginTop:`2px`},children:\[\(0,H\.jsx\)\(`span`,{style:{fontSize:`11px`,color:`#888`,display:`block`,marginBottom:`6px`},children:`Quick Test Accounts \(Click to Fill\):`}\),\(0,H\.jsx\)\(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`},children:[^\]]+\]}\)]}\)/g;

bundle = bundle.replace(quickTestPattern, 'null');

// E. Update authentication check in bundle to support mobile number / phone matching
const oldAuthRegex = /let r=\(e\|\|``\)\.toLowerCase\(\)\.trim\(\),i=t\.find\(e=>\(e\.username\?\.toLowerCase\(\)===r\|\|e\.email\?\.toLowerCase\(\)===r\|\|e\.id\?\.toLowerCase\(\)===r\)/g;
const newAuth = 'let r=(e||``).toLowerCase().trim(),cleanPhone=r.replace(/[^0-9]/g,""),i=t.find(e=>((e.phone&&e.phone.replace(/[^0-9]/g,"")===cleanPhone)||(e.mobile&&e.mobile.replace(/[^0-9]/g,"")===cleanPhone)||(cleanPhone&&cleanPhone.length>=5&&(e.phone?.includes(cleanPhone)||e.mobile?.includes(cleanPhone)))||e.username?.toLowerCase()===r||e.email?.toLowerCase()===r||e.id?.toLowerCase()===r)';

bundle = bundle.replace(oldAuthRegex, newAuth);

fs.writeFileSync('src/bundle.js', bundle);
console.log('src/bundle.js updated successfully for mobile number login and removal of test accounts!');

// 2. Also update src/components/CreatorLoginModal.jsx for source code integrity
let modalSrc = fs.readFileSync('src/components/CreatorLoginModal.jsx', 'utf8');

// Replace Email / Photographer ID with Mobile Number
modalSrc = modalSrc.replace('Email / Photographer ID', 'Mobile Number');
modalSrc = modalSrc.replace('placeholder="e.g. karthik or karthik@vibenow.com"', 'placeholder="Enter 10-digit mobile number"\n                  type="tel"');
modalSrc = modalSrc.replace('placeholder="Password (Default: 123)"', 'placeholder="Enter your password"');

// Remove Quick Test Accounts JSX block
const quickBoxStart = '{/* Quick Demo Shortcuts */}';
const quickBoxEnd = '{/* Primary Login Button */}';
const startPos = modalSrc.indexOf(quickBoxStart);
const endPos = modalSrc.indexOf(quickBoxEnd);

if (startPos !== -1 && endPos !== -1) {
  modalSrc = modalSrc.slice(0, startPos) + modalSrc.slice(endPos);
}

fs.writeFileSync('src/components/CreatorLoginModal.jsx', modalSrc);
console.log('src/components/CreatorLoginModal.jsx updated successfully!');
