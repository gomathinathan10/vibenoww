import './index.css';
import './utils/imageCropper.js';
import './main.js';

// Global date formatter helper
if (typeof window !== 'undefined') {
  window.__vnFormatDate = function(u) {
    if (!u) return '';
    const b = String(u).trim();
    if (/^\d{2}\s*[\/\-]\s*\d{2}\s*[\/\-]\s*\d{4}$/.test(b)) {
      const g = b.split(/[\/\-]/).map(c => c.trim());
      return g[0].padStart(2, '0') + ' / ' + g[1].padStart(2, '0') + ' / ' + g[2];
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(b)) {
      const [g, c, M] = b.split('T')[0].split('-');
      return M.padStart(2, '0') + ' / ' + c.padStart(2, '0') + ' / ' + g;
    }
    const L = new Date(b);
    if (!isNaN(L.getTime()) && L.getFullYear() > 1900) {
      const g = String(L.getDate()).padStart(2, '0');
      const c = String(L.getMonth() + 1).padStart(2, '0');
      const M = L.getFullYear();
      return g + ' / ' + c + ' / ' + M;
    }
    return b;
  };
}
