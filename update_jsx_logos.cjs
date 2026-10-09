const fs = require('fs');

const files = [
  'src/components/Navbar.jsx',
  'src/components/Footer.jsx',
  'src/components/BookingModal.jsx',
  'src/components/MultiBookingModal.jsx',
  'src/components/PhotographerProfileModal.jsx',
  'src/components/QuotationModal.jsx',
  'src/pages/AdminPage.jsx',
  'src/pages/ContactPage.jsx',
  'src/context/DataContext.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('/images/vibenoww-symbol.svg')) {
      content = content.replace(/\/images\/vibenoww-symbol\.svg/g, '/images/vibenoww-logo.png');
      fs.writeFileSync(f, content, 'utf8');
      console.log('Updated logo in:', f);
    }
  }
});

console.log('Done updating logo references in JSX files.');
