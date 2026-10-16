const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, writeBatch } = require('firebase/firestore');

const cfg = require('../firebase-applet-config.json');
const app = initializeApp(cfg);
const db = getFirestore(app, cfg.firestoreDatabaseId || 'ai-studio-coralinkartepers-7de2d54e-2d5d-4e20-a5f3-9aa9659e6dae');

const DATA_FILE = path.join(__dirname, '..', 'coralink-products-data.json');
const INITIAL_PRODUCTS_FILE = path.join(__dirname, '..', 'src', 'data', 'initialProducts.ts');
const LOGO_FILE = path.join(__dirname, '..', 'public', 'LG1.png');
const OUT_DIR = path.join(__dirname, '..', 'public', 'uploads', 'watermarked');
const DIST_OUT_DIR = path.join(__dirname, '..', 'dist', 'uploads', 'watermarked');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(DIST_OUT_DIR)) fs.mkdirSync(DIST_OUT_DIR, { recursive: true });

async function createWatermarkedImage(inputBuffer, filename) {
  const meta = await sharp(inputBuffer).metadata();
  const W = meta.width;
  const H = meta.height;

  const targetWidth = Math.max(90, Math.min(Math.round(W * 0.22), 240));
  const targetHeight = Math.round(targetWidth * (707 / 970));
  const padX = Math.round(targetWidth * 0.08);
  const padY = Math.round(targetHeight * 0.08);
  const pillW = targetWidth + padX * 2;
  const pillH = targetHeight + padY * 2;
  const radius = Math.round(pillH * 0.2);
  const margin = Math.max(14, Math.round(W * 0.025));

  const left = W - pillW - margin;
  const top = H - pillH - margin;

  const pillSvg = Buffer.from(`
    <svg width="${pillW}" height="${pillH}">
      <rect x="0" y="0" width="${pillW}" height="${pillH}" rx="${radius}" ry="${radius}"
        fill="rgba(11, 37, 69, 0.65)" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" />
    </svg>
  `);

  const resizedLogo = await sharp(LOGO_FILE)
    .resize(targetWidth, targetHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const badge = await sharp(pillSvg)
    .composite([{ input: resizedLogo, left: padX, top: padY }])
    .png()
    .toBuffer();

  const outBuffer = await sharp(inputBuffer)
    .composite([{ input: badge, left, top }])
    .webp({ quality: 90 })
    .toBuffer();

  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, outBuffer);

  const distPath = path.join(DIST_OUT_DIR, filename);
  fs.writeFileSync(distPath, outBuffer);

  return `/uploads/watermarked/${filename}`;
}

async function run() {
  console.log('Reading products data...');
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  console.log(`Total products: ${products.length}`);

  // Cache to avoid processing the same image URL twice
  const urlToWatermarkedMap = new Map();
  let count = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.image || p.image.includes('LG1.png') || p.image.includes('/uploads/watermarked/')) {
      continue;
    }

    if (urlToWatermarkedMap.has(p.image)) {
      p.image = urlToWatermarkedMap.get(p.image);
      continue;
    }

    try {
      console.log(`[${i + 1}/${products.length}] Watermarking: ${p.id} - ${p.title}...`);
      let inputBuffer = null;

      if (p.image.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', 'public', p.image);
        if (fs.existsSync(localPath)) {
          inputBuffer = fs.readFileSync(localPath);
        }
      }

      if (!inputBuffer && (p.image.startsWith('http://') || p.image.startsWith('https://'))) {
        const res = await fetch(p.image, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          inputBuffer = Buffer.from(await res.arrayBuffer());
        }
      }

      if (inputBuffer) {
        const safeId = (p.id || 'prod').replace(/[^a-zA-Z0-9_-]/g, '');
        const filename = `wm_${safeId}.webp`;
        const newUrl = await createWatermarkedImage(inputBuffer, filename);
        urlToWatermarkedMap.set(p.image, newUrl);
        p.image = newUrl;
        count++;
        console.log(` -> Stamped watermark: ${newUrl}`);
      } else {
        console.warn(` -> Could not fetch image for ${p.id}: ${p.image}`);
      }
    } catch (err) {
      console.error(`Error watermarking ${p.id}:`, err.message);
    }
  }

  console.log(`\nSuccessfully watermarked ${count} images!`);

  // 1. Write updated coralink-products-data.json
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
  console.log('Updated coralink-products-data.json');

  // 2. Write updated src/data/initialProducts.ts
  const catalogVersion = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const code = `import { Product } from "../types";

export const CATALOG_VERSION = "${catalogVersion}";

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;
  fs.writeFileSync(INITIAL_PRODUCTS_FILE, code, 'utf-8');
  console.log('Updated src/data/initialProducts.ts');

  // 3. Batch update Firestore products
  console.log('Updating Firestore products with watermarked URLs...');
  const chunkSize = 400;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((prod) => {
      const docRef = doc(db, 'products', prod.id);
      batch.update(docRef, { image: prod.image, updatedAt: new Date().toISOString() });
    });
    await batch.commit();
  }
  console.log('Firestore updated successfully!');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
