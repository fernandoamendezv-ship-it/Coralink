import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Minimal pure-Node PNG generator
function createPNG(width, height, getPixel) {
  // Buffer for raw uncompressed image data (with filter byte 0 at start of each scanline)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace: None
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Coralink Brand Color Palette
// Navy: #0B2545 = (11, 37, 69)
// Turquoise: #1BA7D9 = (27, 167, 217)
// Coral: #FF6B35 = (255, 107, 53)
// Light Cyan: #A5EEFF = (165, 238, 255)
// White: (255, 255, 255)

function coralinkPainter(isMaskable) {
  return function(x, y, w, h) {
    const nx = (x / w) * 2 - 1; // -1 to 1
    const ny = (y / h) * 2 - 1; // -1 to 1
    const dist = Math.sqrt(nx * nx + ny * ny);

    if (isMaskable) {
      // Solid white background with central logo
      const safeRadius = 0.78;
      if (dist > safeRadius) {
        return [255, 255, 255, 255];
      }
    }

    // Outer subtle ring
    if (dist >= 0.88 && dist <= 0.94) {
      const angle = Math.atan2(ny, nx);
      if (angle > -1.5 && angle < 2.0) {
        return [27, 167, 217, 255]; // Turquoise ring
      } else {
        return [255, 107, 53, 255]; // Coral ring
      }
    }

    // Background circular area
    if (dist < 0.88) {
      // Wave curve calculation
      const waveFront = -0.15 + 0.3 * Math.sin(nx * 3.2 + 0.8) - 0.2 * nx * nx;
      const isWaveCrest = ny < waveFront && ny > waveFront - 0.45 && nx < 0.3;
      const isDeepWater = ny < waveFront - 0.25 && nx < 0.1;

      if (isDeepWater) {
        return [11, 37, 69, 255]; // Navy
      }
      if (isWaveCrest) {
        return [27, 167, 217, 255]; // Turquoise
      }

      // Center Coralink accent band
      if (ny >= 0.05 && ny <= 0.22 && nx >= -0.65 && nx <= 0.65) {
        if (nx < 0) {
          // Cora (Coral)
          return [255, 107, 53, 255];
        } else {
          // Link (Turquoise)
          return [27, 167, 217, 255];
        }
      }

      // HMW top text band indicator
      if (ny >= -0.32 && ny <= -0.12 && Math.abs(nx) <= 0.45) {
        return [11, 37, 69, 255]; // Navy
      }

      // Arte & Personalizacion Caribeña bottom band
      if (ny >= 0.42 && ny <= 0.50 && Math.abs(nx) <= 0.6) {
        if (nx > 0.1) return [255, 107, 53, 255]; // Caribeña
        return [11, 37, 69, 255]; // Arte & Personalización
      }

      // White background inside disk
      return [255, 255, 255, 255];
    }

    // Outside disk transparent (or white if maskable)
    return isMaskable ? [255, 255, 255, 255] : [0, 0, 0, 0];
  };
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PWA icons...');

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, coralinkPainter(false)));
console.log('✓ pwa-192x192.png created');

fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, coralinkPainter(false)));
console.log('✓ pwa-512x512.png created');

fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, coralinkPainter(true)));
console.log('✓ pwa-maskable-512x512.png created');

fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, coralinkPainter(false)));
console.log('✓ apple-touch-icon.png created');

fs.writeFileSync(path.join(outDir, 'favicon.ico'), createPNG(64, 64, coralinkPainter(false)));
console.log('✓ favicon.ico created');

console.log('All icons generated successfully!');
