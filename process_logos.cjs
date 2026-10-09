const fs = require('fs');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function decodePng(buf) {
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  let idatBuffers = [];
  let offset = 8;
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') idatBuffers.push(buf.slice(offset + 8, offset + 8 + len));
    offset += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatBuffers));
  const rawRgba = Buffer.alloc(width * height * 4);
  
  // Unfilter scanlines (type 0, 1, 2, 3, 4)
  const bpp = 4;
  let srcOffset = 0;
  let dstOffset = 0;
  const prevRow = Buffer.alloc(width * bpp);
  const currentRow = Buffer.alloc(width * bpp);

  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcOffset++];
    for (let x = 0; x < width * bpp; x++) {
      const val = decompressed[srcOffset++];
      const left = (x >= bpp) ? currentRow[x - bpp] : 0;
      const up = prevRow[x];
      const upLeft = (x >= bpp) ? prevRow[x - bpp] : 0;
      let rawVal = 0;
      if (filter === 0) rawVal = val;
      else if (filter === 1) rawVal = (val + left) & 0xff;
      else if (filter === 2) rawVal = (val + up) & 0xff;
      else if (filter === 3) rawVal = (val + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        let pr = 0;
        if (pa <= pb && pa <= pc) pr = left;
        else if (pb <= pc) pr = up;
        else pr = upLeft;
        rawVal = (val + pr) & 0xff;
      }
      currentRow[x] = rawVal;
    }
    currentRow.copy(rawRgba, dstOffset);
    currentRow.copy(prevRow, 0);
    dstOffset += width * bpp;
  }

  return { width, height, rawRgba };
}

function encodePng(rawRgba, width, height) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Filter 0 for each row: 1 byte filter (0) + row bytes
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let scanOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[scanOffset++] = 0; // filter None
    rawRgba.copy(scanlines, scanOffset, y * width * 4, (y + 1) * width * 4);
    scanOffset += width * 4;
  }
  const idatData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const inputPath = 'C:/Users/lenovo/.gemini/antigravity-ide/brain/ca8128e2-4498-4133-86cb-bc69dc395d6f/.user_uploaded/media_1791482680537.png';
const inputBuf = fs.readFileSync(inputPath);
const { width, height, rawRgba } = decodePng(inputBuf);
console.log('Decoded original PNG:', width, 'x', height);

// Find tight bounding box of content
let minX = width, maxX = 0, minY = height, maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const a = rawRgba[(y * width + x) * 4 + 3];
    if (a > 15) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('Bounds:', { minX, maxX, minY, maxY });

// Crop with a little breathable padding (e.g. 16px around)
const pad = 16;
const cropX1 = Math.max(0, minX - pad);
const cropY1 = Math.max(0, minY - pad);
const cropX2 = Math.min(width - 1, maxX + pad);
const cropY2 = Math.min(height - 1, maxY + pad);
const cropW = cropX2 - cropX1 + 1;
const cropH = cropY2 - cropY1 + 1;
console.log('Cropped dimensions:', cropW, 'x', cropH);

const croppedRgba = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  const srcY = cropY1 + y;
  const srcRow = (srcY * width + cropX1) * 4;
  rawRgba.copy(croppedRgba, y * cropW * 4, srcRow, srcRow + cropW * 4);
}
const croppedPng = encodePng(croppedRgba, cropW, cropH);

// Also create a square centered version for symbol / favicon
const markSize = Math.max(cropW, cropH) + 32;
const squareRgba = Buffer.alloc(markSize * markSize * 4); // all 0 (transparent)
const offsetX = Math.floor((markSize - cropW) / 2);
const offsetY = Math.floor((markSize - cropH) / 2);
for (let y = 0; y < cropH; y++) {
  const dstStart = ((offsetY + y) * markSize + offsetX) * 4;
  croppedRgba.copy(squareRgba, dstStart, y * cropW * 4, (y + 1) * cropW * 4);
}
const squarePng = encodePng(squareRgba, markSize, markSize);

// Also create wave-symbol-only (y from minY to 585) for compact icons
const symbolY2 = 585;
const symPad = 12;
const symX1 = Math.max(0, minX - symPad);
const symY1 = Math.max(0, minY - symPad);
const symX2 = Math.min(width - 1, maxX + symPad);
const symY2_pad = Math.min(height - 1, symbolY2 + symPad);
const symW = symX2 - symX1 + 1;
const symH = symY2_pad - symY1 + 1;
const symSquareSize = Math.max(symW, symH) + 20;
const symSquareRgba = Buffer.alloc(symSquareSize * symSquareSize * 4);
const symOffsetX = Math.floor((symSquareSize - symW) / 2);
const symOffsetY = Math.floor((symSquareSize - symH) / 2);
for (let y = 0; y < symH; y++) {
  const srcRow = ((symY1 + y) * width + symX1) * 4;
  const dstRow = ((symOffsetY + y) * symSquareSize + symOffsetX) * 4;
  rawRgba.copy(symSquareRgba, dstRow, srcRow, srcRow + symW * 4);
}
const symbolPng = encodePng(symSquareRgba, symSquareSize, symSquareSize);

console.log('Cropped PNG size:', croppedPng.length);
console.log('Square PNG size:', squarePng.length);
console.log('Symbol PNG size:', symbolPng.length);

// Save cropped PNG as vibenoww-logo.png
fs.writeFileSync('public/images/vibenoww-logo.png', croppedPng);
fs.writeFileSync('public/vibenoww-logo.png', croppedPng);
fs.writeFileSync('public/images/vibenoww-logo.jpg', croppedPng); // serve same png content
fs.writeFileSync('public/vibenoww-logo.jpg', croppedPng);

// Save full original PNG as vibenoww-logo-original.png
fs.writeFileSync('public/images/vibenoww-logo-original.png', inputBuf);
fs.writeFileSync('public/vibenoww-logo-original.png', inputBuf);

// Save square PNG as favicon & symbols
fs.writeFileSync('public/favicon.png', squarePng);
fs.writeFileSync('public/images/vibenoww-symbol.png', squarePng);
fs.writeFileSync('public/vibenoww-symbol.png', squarePng);

// Update vibenoww-symbol.svg to match
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropW} ${cropH}" width="${cropW}" height="${cropH}">
  <image href="/images/vibenoww-logo.png" width="${cropW}" height="${cropH}" />
</svg>`;
fs.writeFileSync('public/images/vibenoww-symbol.svg', svgContent);

console.log('Successfully written all logo files in public/ and public/images/!');
