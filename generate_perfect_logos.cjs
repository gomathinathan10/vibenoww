const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

console.log('--- Processing Perfect Logo PNGs ---');
const raw = jpeg.decode(fs.readFileSync('scratch_vibenoww-logo.jpg'));
const w = raw.width;
const h = raw.height;

// Background base color: ~RGB(10, 20, 42)
const BG_R = 10, BG_G = 20, BG_B = 42;

// 1. Generate full transparent PNG
const transPng = new PNG({ width: w, height: h });
let minX = w, maxX = 0, minY = h, maxY = 0;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;
    const r = raw.data[idx];
    const g = raw.data[idx + 1];
    const b = raw.data[idx + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);

    let alpha = 0;
    let outR = r, outG = g, outB = b;

    if (lum > 95) {
      // Solid white / light metallic silver letter 'VIBENOWW'
      alpha = 255;
      outR = Math.min(255, Math.round(r * 1.05));
      outG = Math.min(255, Math.round(g * 1.05));
      outB = Math.min(255, Math.round(b * 1.05));
    } else if (max > 78 || lum > 65) {
      // Solid ribbon / neon foreground
      alpha = 255;
      // Subtract background tint to get pure vivid neon
      outR = Math.max(0, Math.min(255, r));
      outG = Math.max(0, Math.min(255, g));
      outB = Math.max(0, Math.min(255, b));
    } else if (max > 54 || lum > 42) {
      // Smooth edge antialiasing
      const factor = Math.max(0, Math.min(1, Math.max((max - 54) / (78 - 54), (lum - 42) / (65 - 42))));
      alpha = Math.round(factor * 255);
      // Un-blend against background
      outR = Math.min(255, Math.max(0, Math.round((r - BG_R * (1 - factor)) / Math.max(factor, 0.1))));
      outG = Math.min(255, Math.max(0, Math.round((g - BG_G * (1 - factor)) / Math.max(factor, 0.1))));
      outB = Math.min(255, Math.max(0, Math.round((b - BG_B * (1 - factor)) / Math.max(factor, 0.1))));
    } else {
      alpha = 0;
      outR = 0;
      outG = 0;
      outB = 0;
    }

    if (alpha > 30) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    transPng.data[idx] = outR;
    transPng.data[idx + 1] = outG;
    transPng.data[idx + 2] = outB;
    transPng.data[idx + 3] = alpha;
  }
}

console.log('Bounds:', { minX, maxX, minY, maxY }, 'Width:', maxX - minX + 1, 'Height:', maxY - minY + 1);

// 2. Crop full transparent logo with 18px padding
const pad = 18;
const cropX1 = Math.max(0, minX - pad);
const cropY1 = Math.max(0, minY - pad);
const cropX2 = Math.min(w - 1, maxX + pad);
const cropY2 = Math.min(h - 1, maxY + pad);
const cropW = cropX2 - cropX1 + 1;
const cropH = cropY2 - cropY1 + 1;

const croppedLogo = new PNG({ width: cropW, height: cropH });
PNG.bitblt(transPng, croppedLogo, cropX1, cropY1, cropW, cropH, 0, 0);
const croppedLogoBuf = PNG.sync.write(croppedLogo);

// 3. Extract Ribbon Symbol only (minY to approximately where letters begin, y=585)
const symY2 = 585;
const symPad = 16;
const symX1 = Math.max(0, minX - symPad);
const symY1 = Math.max(0, minY - symPad);
const symX2 = Math.min(w - 1, maxX + symPad);
const symW = symX2 - symX1 + 1;
const symH = symY2 - symY1 + 1;

// Put symbol into square canvas (512x512)
const symSize = 512;
const symSquare = new PNG({ width: symSize, height: symSize });
const scale = Math.min((symSize - 40) / symW, (symSize - 40) / symH);
const dstW = Math.round(symW * scale);
const dstH = Math.round(symH * scale);
const dstX = Math.round((symSize - dstW) / 2);
const dstY = Math.round((symSize - dstH) / 2);

for (let y = 0; y < dstH; y++) {
  for (let x = 0; x < dstW; x++) {
    const srcX = symX1 + Math.min(symW - 1, Math.floor(x / scale));
    const srcY = symY1 + Math.min(symH - 1, Math.floor(y / scale));
    const srcIdx = (srcY * w + srcX) * 4;
    const dstIdx = ((dstY + y) * symSize + (dstX + x)) * 4;

    symSquare.data[dstIdx] = transPng.data[srcIdx];
    symSquare.data[dstIdx + 1] = transPng.data[srcIdx + 1];
    symSquare.data[dstIdx + 2] = transPng.data[srcIdx + 2];
    symSquare.data[dstIdx + 3] = transPng.data[srcIdx + 3];
  }
}

const symSquareBuf = PNG.sync.write(symSquare);

// 4. Exact original lossless PNG (1024x1024)
const originalLossless = new PNG({ width: w, height: h });
raw.data.copy(originalLossless.data);
const originalLosslessBuf = PNG.sync.write(originalLossless);

// Write to targets
const filesToWrite = [
  ['public/images/vibenoww-logo.png', croppedLogoBuf],
  ['public/vibenoww-logo.png', croppedLogoBuf],
  ['public/images/vibenoww-logo.jpg', croppedLogoBuf],
  ['public/vibenoww-logo.jpg', croppedLogoBuf],
  ['public/images/vibenoww-symbol.png', symSquareBuf],
  ['public/vibenoww-symbol.png', symSquareBuf],
  ['public/favicon.png', symSquareBuf],
  ['public/images/vibenoww-logo-original.png', originalLosslessBuf],
  ['public/vibenoww-logo-original.png', originalLosslessBuf]
];

filesToWrite.forEach(([dest, buf]) => {
  fs.writeFileSync(dest, buf);
  console.log('✅ Written:', dest, '(' + buf.length + ' bytes)');
});

// Update SVG wrapper
const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropW} ${cropH}" width="${cropW}" height="${cropH}">
  <image href="/images/vibenoww-logo.png" width="${cropW}" height="${cropH}" />
</svg>`;
fs.writeFileSync('public/images/vibenoww-symbol.svg', svgWrapper, 'utf8');
console.log('✅ Written public/images/vibenoww-symbol.svg');
