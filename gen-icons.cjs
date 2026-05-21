const { deflateSync } = require('zlib');
const fs = require('fs');

function createIconPNG(size) {
  const rowLen = 1 + size * 4;
  const rawData = Buffer.alloc(rowLen * size);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;

  for (let y = 0; y < size; y++) {
    rawData[y * rowLen] = 0;
    for (let x = 0; x < size; x++) {
      const offset = y * rowLen + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist <= outerR) {
        rawData[offset] = 20;
        rawData[offset+1] = 184;
        rawData[offset+2] = 166;
        rawData[offset+3] = 255;
      } else {
        rawData[offset] = 15;
        rawData[offset+1] = 15;
        rawData[offset+2] = 26;
        rawData[offset+3] = 255;
      }
    }
  }

  const compressed = deflateSync(rawData);
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const t = Buffer.from(type);
    const c = Buffer.concat([t, data]);
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < c.length; i++) {
      crc ^= c[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;
    const cb = Buffer.alloc(4);
    cb.writeUInt32BE(crc);
    return Buffer.concat([len, t, data, cb]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;

  return Buffer.concat([sig, chunk('IHDR',ihdr), chunk('IDAT',compressed), chunk('IEND',Buffer.alloc(0))]);
}

fs.writeFileSync('public/icons/icon-192.png', createIconPNG(192));
fs.writeFileSync('public/icons/icon-512.png', createIconPNG(512));
console.log('Icons generated');
