const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. In the first occurrence (@media(max-width:1024px)), replace the old side-drawer styles
const oldBlock1 = '.header--nav-links{border-left:1px solid var(--color-border-dark);background:#080b11;flex-direction:column;align-items:flex-start;gap:20px;width:300px;height:100vh;padding:90px 24px 30px;transition:right .35s;position:fixed;top:0;right:-100%;overflow-y:auto;box-shadow:-10px 0 30px #0009}.header--nav-links.mobile-open{right:0}.header--nav-links li{width:100%}.header--nav-links li a{padding:8px 0;font-size:1.05rem;display:block}';
const newBlock1 = '.header--nav-links{display:none}';

if (css.includes(oldBlock1)) {
  css = css.replace(oldBlock1, newBlock1);
  console.log('Replaced old drawer block 1 successfully.');
} else {
  console.log('Old block 1 pattern not matched directly, will check alternatives.');
}

// 2. In the second occurrence (@media screen and (max-width:991px)), replace the full-screen takeover
const oldBlock2Start = '.header--nav-links{display:none}.header--nav-links.mobile-open{display:flex!important;flex-direction:column!important;position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;background:#080b11fa!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;z-index:1050!important;padding:85px 24px 40px!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;gap:4px!important;box-sizing:border-box!important}';

const newCompactMobileNavCSS = `
/* ==========================================================================
   MOBILE NAVBAR & THREE-DOT (⋮) COMPACT NAVIGATION MENU
   ========================================================================== */
.mobile-nav-backdrop {
  display: none;
}

@media screen and (max-width: 1024px) {
  .header--navbar {
    padding: 12px 0 !important;
  }
  .header--navbar .container {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    position: relative !important;
  }
  .header--actions {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }
  .mobile-nav-toggle {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 38px !important;
    height: 38px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 50% !important;
    color: #ffffff !important;
    cursor: pointer !important;
    z-index: 1110 !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    padding: 0 !important;
    flex-shrink: 0 !important;
  }
  .mobile-nav-toggle:hover,
  .mobile-nav-toggle:active,
  .mobile-nav-toggle.active {
    background: rgba(0, 210, 255, 0.2) !important;
    border-color: #00d2ff !important;
    color: #00d2ff !important;
    box-shadow: 0 0 14px rgba(0, 210, 255, 0.4) !important;
    transform: scale(1.05) !important;
  }
  .mobile-nav-backdrop {
    display: block !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    background: rgba(5, 8, 20, 0.5) !important;
    backdrop-filter: blur(2px) !important;
    -webkit-backdrop-filter: blur(2px) !important;
    z-index: 1090 !important;
  }
  .header--nav-links {
    display: none !important;
  }
  .header--nav-links.mobile-open {
    display: flex !important;
    flex-direction: column !important;
    position: absolute !important;
    top: calc(100% + 8px) !important;
    right: 16px !important;
    left: auto !important;
    bottom: auto !important;
    width: 250px !important;
    max-width: calc(100vw - 32px) !important;
    height: auto !important;
    max-height: calc(100dvh - 85px) !important;
    background: rgba(10, 14, 31, 0.98) !important;
    border: 1px solid rgba(255, 255, 255, 0.14) !important;
    border-radius: 16px !important;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 210, 255, 0.16) !important;
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    z-index: 1200 !important;
    padding: 10px 8px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 2px !important;
    box-sizing: border-box !important;
    transform-origin: top right !important;
    animation: mobileCompactMenuPop 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  @keyframes mobileCompactMenuPop {
    0% {
      opacity: 0;
      transform: scale(0.92) translateY(-6px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  .header--nav-links.mobile-open li {
    width: 100% !important;
    list-style: none !important;
    margin: 0 !important;
  }
  .header--nav-links.mobile-open li a {
    display: flex !important;
    align-items: center !important;
    padding: 9px 14px !important;
    font-size: 14.5px !important;
    font-weight: 500 !important;
    color: #e2e8f0 !important;
    border-radius: 10px !important;
    transition: all 0.16s ease !important;
    text-decoration: none !important;
  }
  .header--nav-links.mobile-open li a:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    color: #ffffff !important;
    transform: translateX(3px) !important;
  }
  .header--nav-links.mobile-open li.active a {
    background: rgba(0, 210, 255, 0.14) !important;
    color: #00d2ff !important;
    font-weight: 700 !important;
    box-shadow: inset 0 0 12px rgba(0, 210, 255, 0.18) !important;
  }
  .header--nav-links.mobile-open li.active a:after {
    display: none !important;
  }
  .header--nav-links.mobile-open li:last-child {
    margin-top: 8px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding-top: 10px !important;
  }
  .header--nav-links.mobile-open li:last-child .btn {
    padding: 8px 14px !important;
    font-size: 0.82rem !important;
    border-radius: 20px !important;
  }
}

@media screen and (max-width: 768px) {
  .header--actions > .btn-primary {
    display: none !important;
  }
}

@media screen and (min-width: 1025px) {
  .mobile-nav-toggle {
    display: none !important;
  }
  .mobile-nav-backdrop {
    display: none !important;
  }
}
`;

// Append the robust, clean compact mobile navbar CSS to the end of index.css
css += '\n' + newCompactMobileNavCSS + '\n';
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated index.css with compact mobile navbar styles!');
