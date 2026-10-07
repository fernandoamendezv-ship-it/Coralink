// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// src/data/postimagesGallery.ts
var POSTIMAGES_GALLERY_URL = "https://postimg.cc/gallery/zJjp92t";
var POSTIMAGES_GALLERY_ITEMS = [
  // Llaveros
  {
    id: "llavero-faja-de-cuerina",
    title: "Llavero faja de cuerina",
    url: "https://i.postimg.cc/Z5QhNyYX/Llavero-faja-de-cuerina.jpg",
    viewer: "https://postimg.cc/68CSJqvh",
    category: "Llaveros",
    keywords: ["llavero", "faja", "cuerina", "cuero", "faja de cuerina"]
  },
  {
    id: "llavero-ctira-cuero",
    title: "Llavero con tira de cuero",
    url: "https://i.postimg.cc/zBLp4VTx/Llavero-CTira-Cuero.jpg",
    viewer: "https://postimg.cc/5YVwC97z",
    category: "Llaveros",
    keywords: ["llavero", "tira", "cuero", "tira de cuero", "ctira"]
  },
  {
    id: "llaveros-mdf",
    title: "Llaveros MDF",
    url: "https://i.postimg.cc/PrZD919K/Llaveros-MDF.jpg",
    viewer: "https://postimg.cc/1fm4NV9N",
    category: "Llaveros",
    keywords: ["llavero", "llaveros", "mdf", "madera"]
  },
  {
    id: "llavero-giratorio-cc",
    title: "Llavero giratorio CC",
    url: "https://i.postimg.cc/jSdQH5dd/Llavero-giratorio-CC.jpg",
    viewer: "https://postimg.cc/N5SHYQHW",
    category: "Llaveros",
    keywords: ["llavero", "giratorio", "metalico", "cc"]
  },
  // Joyería y Accesorios
  {
    id: "dije-sencillo-con-cadena",
    title: "Dije sencillo con cadena",
    url: "https://i.postimg.cc/HnK6hS1z/Dije-sencillo-con-cadena.jpg",
    viewer: "https://postimg.cc/JHN3y5nH",
    category: "Joyer\xEDa",
    keywords: ["dije", "joya", "joyeria", "cadena", "sencillo", "collar", "foto_joya"]
  },
  {
    id: "dije-doble-cara-sin-cadena",
    title: "Dije doble cara sin cadena",
    url: "https://i.postimg.cc/c4GdtGHx/Dije-doble-cara-sin-cadena.jpg",
    viewer: "https://postimg.cc/JtxfSgZv",
    category: "Joyer\xEDa",
    keywords: ["dije", "joya", "doble cara", "sin cadena", "collar", "foto_joya"]
  },
  {
    id: "aretes-mdf",
    title: "Aretes MDF",
    url: "https://i.postimg.cc/rpNg7L6S/Aretes-MDF.jpg",
    viewer: "https://postimg.cc/gwrv6Q2J",
    category: "Joyer\xEDa",
    keywords: ["aretes", "mdf", "pendientes", "joya", "foto_joya"]
  },
  {
    id: "billetera",
    title: "Billetera personalizada",
    url: "https://i.postimg.cc/RFPdVQZn/Billetera.jpg",
    viewer: "https://postimg.cc/phFzsj82",
    category: "Accesorios",
    keywords: ["billetera", "cartera", "cuero", "bolsillo"]
  },
  // Cerámica
  {
    id: "ceramica-4x4",
    title: "Cer\xE1mica 4x4",
    url: "https://i.postimg.cc/1RNq1D9K/Ceramica-4x4.jpg",
    viewer: "https://postimg.cc/nMpzvj9s",
    category: "Cer\xE1mica",
    keywords: ["ceramica", "azulejo", "4x4", "cuadro"]
  },
  {
    id: "ceramica-6x6",
    title: "Cer\xE1mica 6x6",
    url: "https://i.postimg.cc/gc6Zb3Yy/Ceramica-6x6.jpg",
    viewer: "https://postimg.cc/fkDLxtSk",
    category: "Cer\xE1mica",
    keywords: ["ceramica", "azulejo", "6x6"]
  },
  {
    id: "ceramica-6x8",
    title: "Cer\xE1mica 6x8",
    url: "https://i.postimg.cc/wxsmYD6c/Ceramica-6x8.jpg",
    viewer: "https://postimg.cc/5jb0wYQ6",
    category: "Cer\xE1mica",
    keywords: ["ceramica", "azulejo", "6x8"]
  },
  {
    id: "ceramica-8x10",
    title: "Cer\xE1mica 8x10",
    url: "https://i.postimg.cc/c18nGfsB/Ceramica-8x10.jpg",
    viewer: "https://postimg.cc/XX4JwGBr",
    category: "Cer\xE1mica",
    keywords: ["ceramica", "azulejo", "8x10"]
  },
  {
    id: "ceramica-8x12",
    title: "Cer\xE1mica 8x12",
    url: "https://i.postimg.cc/jd0JxC5z/Ceramica-8x12.jpg",
    viewer: "https://postimg.cc/pyCdkWKT",
    category: "Cer\xE1mica",
    keywords: ["ceramica", "azulejo", "8x12"]
  },
  // Cojines
  {
    id: "cojin-corazon",
    title: "Coj\xEDn Coraz\xF3n",
    url: "https://i.postimg.cc/kX3tJD48/Cojin-corazon.jpg",
    viewer: "https://postimg.cc/0rnNZk72",
    category: "Cojines",
    keywords: ["cojin", "almohada", "corazon"]
  },
  {
    id: "cojin-30x30",
    title: "Coj\xEDn 30x30",
    url: "https://i.postimg.cc/wBp5pJHQ/cojin-30x30.jpg",
    viewer: "https://postimg.cc/jDMn6DDD",
    category: "Cojines",
    keywords: ["cojin", "almohada", "30x30"]
  },
  {
    id: "cojin-35x35",
    title: "Coj\xEDn 35x35",
    url: "https://i.postimg.cc/VN898M1g/cojin-35x35.jpg",
    viewer: "https://postimg.cc/QFfKgFFK",
    category: "Cojines",
    keywords: ["cojin", "almohada", "35x35"]
  },
  {
    id: "cojin-40x40",
    title: "Coj\xEDn 40x40",
    url: "https://i.postimg.cc/8CSdSWDw/cojin-40x40.jpg",
    viewer: "https://postimg.cc/cvFt7vv8",
    category: "Cojines",
    keywords: ["cojin", "almohada", "40x40"]
  },
  // Foto Roca
  {
    id: "foto-roca-10x15",
    title: "Foto Roca 10x15",
    url: "https://i.postimg.cc/8CSdSWDt/Foto-roca-10x15.jpg",
    viewer: "https://postimg.cc/4YWHvYY9",
    category: "Foto Roca",
    keywords: ["foto roca", "roca", "piedra", "10x15"]
  },
  {
    id: "foto-roca-15x15",
    title: "Foto Roca 15x15",
    url: "https://i.postimg.cc/DzTQTsFY/Foto-roca-15x15.jpg",
    viewer: "https://postimg.cc/5XsQ5XXw",
    category: "Foto Roca",
    keywords: ["foto roca", "roca", "piedra", "15x15"]
  },
  {
    id: "foto-roca-15x20",
    title: "Foto Roca 15x20",
    url: "https://i.postimg.cc/43gvgtZ0/Foto-roca-15x20.jpg",
    viewer: "https://postimg.cc/210Ld11d",
    category: "Foto Roca",
    keywords: ["foto roca", "roca", "piedra", "15x20"]
  },
  {
    id: "foto-roca-20x20",
    title: "Foto Roca 20x20",
    url: "https://i.postimg.cc/3NxTS7B6/Foto-roca-20x20.jpg",
    viewer: "https://postimg.cc/Kkwwj6Cr",
    category: "Foto Roca",
    keywords: ["foto roca", "roca", "piedra", "20x20"]
  },
  {
    id: "foto-roca-corazon",
    title: "Foto Roca Coraz\xF3n",
    url: "https://i.postimg.cc/nrhJRZ2x/Foto-roca-corazon.jpg",
    viewer: "https://postimg.cc/7GddhFjt",
    category: "Foto Roca",
    keywords: ["foto roca", "roca", "corazon"]
  },
  {
    id: "foto-roca-curva",
    title: "Foto Roca Curva",
    url: "https://i.postimg.cc/1X3QCPBZ/Foto-roca-curva.jpg",
    viewer: "https://postimg.cc/5YTTyhDP",
    category: "Foto Roca",
    keywords: ["foto roca", "roca", "curva"]
  },
  {
    id: "foto-roca-pizarra",
    title: "Foto Roca Pizarra",
    url: "https://i.postimg.cc/tJ4jSy5m/Foto-roca-pizarra.jpg",
    viewer: "https://postimg.cc/BLkkbrRx",
    category: "Foto Roca",
    keywords: ["foto roca", "roca", "pizarra"]
  },
  {
    id: "foto-roca-redondo",
    title: "Foto Roca Redondo",
    url: "https://i.postimg.cc/Kj82qFfF/Foto-roca-redondo.jpg",
    viewer: "https://postimg.cc/Q9wwC2vn",
    category: "Foto Roca",
    keywords: ["foto roca", "roca", "redondo", "circular"]
  },
  // Marcos y Retrateras
  {
    id: "marco-de-madera",
    title: "Marco de madera",
    url: "https://i.postimg.cc/Kj82qFNH/Marco-de-madera.jpg",
    viewer: "https://postimg.cc/N9SSF3Z6",
    category: "Marcos",
    keywords: ["marco", "madera", "cuadro"]
  },
  {
    id: "marco-de-madera-rectangular",
    title: "Marco de madera rectangular",
    url: "https://i.postimg.cc/7hZksDVp/Marco-de-madera-Rectangular.jpg",
    viewer: "https://postimg.cc/r033sB7J",
    category: "Marcos",
    keywords: ["marco", "madera", "rectangular"]
  },
  {
    id: "marco-de-madera-con-base",
    title: "Marco de madera con base",
    url: "https://i.postimg.cc/vTm5FH2N/Marco-de-madera-con-base.jpg",
    viewer: "https://postimg.cc/tZLsFyj3",
    category: "Marcos",
    keywords: ["marco", "madera", "base", "con base"]
  },
  {
    id: "retratera-mdf-friends",
    title: "Retratera MDF Friends",
    url: "https://i.postimg.cc/sfvLbtvh/Retratera-MDF-Friends.jpg",
    viewer: "https://postimg.cc/w3YFm45q",
    category: "Retrateras",
    keywords: ["retratera", "mdf", "friends", "amigos", "portarretrato"]
  },
  {
    id: "retratera-mdf-love",
    title: "Retratera MDF Love",
    url: "https://i.postimg.cc/44m0jrmK/Retratera-MDF-Love.jpg",
    viewer: "https://postimg.cc/141Mq70P",
    category: "Retrateras",
    keywords: ["retratera", "mdf", "love", "amor", "portarretrato"]
  },
  {
    id: "retratera-mdf-i-love-mom",
    title: "Retratera MDF I Love MOM",
    url: "https://i.postimg.cc/137SpDT1/Retratera-MDF-I-Love-MOM.jpg",
    viewer: "https://postimg.cc/qNKWr641",
    category: "Retrateras",
    keywords: ["retratera", "mdf", "mom", "mama", "madre", "love mom"]
  },
  {
    id: "retratera-mdf-familia",
    title: "Retratera MDF Familia",
    url: "https://i.postimg.cc/3JXmJFRv/Retratera-MDF-Familia.jpg",
    viewer: "https://postimg.cc/N505dTRs",
    category: "Retrateras",
    keywords: ["retratera", "mdf", "familia", "family"]
  },
  // Decoración y Otros
  {
    id: "plato",
    title: "Plato decorativo personalizado",
    url: "https://i.postimg.cc/3N1qZBdG/Plato.jpg",
    viewer: "https://postimg.cc/Lgqv9jk4",
    category: "Decoraci\xF3n",
    keywords: ["plato", "decorativo", "porcelana"]
  },
  {
    id: "reloj-cubo",
    title: "Reloj en Forma de CUBO",
    url: "https://i.postimg.cc/D0nDsDy8/Reloj-en-Forma-de-CUBO.jpg",
    viewer: "https://postimg.cc/8JXtgZvS",
    category: "Decoraci\xF3n",
    keywords: ["reloj", "cubo", "forma de cubo"]
  },
  {
    id: "coralink-logo-lg1",
    title: "Coralink Logo LG1",
    url: "https://i.postimg.cc/bNc2ydJ2/LG1.jpg",
    viewer: "https://postimg.cc/rzjpgV58",
    category: "Logos",
    keywords: ["logo", "coralink", "lg1", "marca"]
  },
  // Tazas
  {
    id: "taza-blanca",
    title: "Taza Blanca Cl\xE1sica 11oz",
    url: "https://i.postimg.cc/638qfkFh/Taza-blanca.jpg",
    viewer: "https://postimg.cc/wyd96Gqt",
    category: "Tazas",
    keywords: ["taza", "blanca", "clasica", "pocillo", "mug", "11oz"]
  },
  {
    id: "taza-blanca-17-oz-conica",
    title: "Taza blanca 17 oz c\xF3nica",
    url: "https://i.postimg.cc/Jns05fSx/Taza-blanca-17-oz-conica.jpg",
    viewer: "https://postimg.cc/47TXJSfH",
    category: "Tazas",
    keywords: ["taza", "conica", "17 oz", "17oz"]
  },
  {
    id: "taza-blanca-cuchara-plana",
    title: "Taza blanca con cuchara plana",
    url: "https://i.postimg.cc/RFWhLk2P/Taza-blanca-con-cuchara-de-color-plana.jpg",
    viewer: "https://postimg.cc/sQR3VNjS",
    category: "Tazas",
    keywords: ["taza", "cuchara", "plana", "cuchara plana"]
  },
  {
    id: "taza-blanca-cuchara-semi-conica",
    title: "Taza blanca con cuchara semi-c\xF3nica",
    url: "https://i.postimg.cc/DZS0P9Rj/Taza-blanca-con-cuchara-de-color-semi-conica.jpg",
    viewer: "https://postimg.cc/N9wQgzsm",
    category: "Tazas",
    keywords: ["taza", "cuchara", "semi conica", "semi-conica"]
  },
  {
    id: "taza-blanca-pelota-futbol",
    title: "Taza blanca con pelota de f\xFAtbol",
    url: "https://i.postimg.cc/W3dzwBxf/Taza-blanca-con-pelota-de-futbol.jpg",
    viewer: "https://postimg.cc/62NB9mWd",
    category: "Tazas",
    keywords: ["taza", "futbol", "pelota", "balon"]
  },
  {
    id: "taza-blanca-interior-happy",
    title: "Taza blanca interior HAPPY",
    url: "https://i.postimg.cc/ydDxyM2F/Taza-blanca-interior-HAPPY.jpg",
    viewer: "https://postimg.cc/2bfCzKk6",
    category: "Tazas",
    keywords: ["taza", "happy", "interior happy"]
  },
  {
    id: "taza-blanca-interior-i-love",
    title: "Taza blanca interior I LOVE",
    url: "https://i.postimg.cc/DZS0P9Rr/Taza-blanca-interior-I-LOVE.jpg",
    viewer: "https://postimg.cc/hzqKS5Dv",
    category: "Tazas",
    keywords: ["taza", "love", "interior i love", "i love"]
  },
  {
    id: "taza-blanca-interior-asa-color",
    title: "Taza Blanca Interior y Asa Color",
    url: "https://i.postimg.cc/Hxrn9qF3/Taza-Blanca-Interior-y-Asa-Color.jpg",
    viewer: "https://postimg.cc/r0Lq8PVt",
    category: "Tazas",
    keywords: ["taza", "asa", "interior color", "asa color"]
  },
  {
    id: "taza-con-tapa-silicon",
    title: "Taza con tapa silic\xF3n",
    url: "https://i.postimg.cc/mDPkyvK7/Taza-con-tapa-silicon.jpg",
    viewer: "https://postimg.cc/MM8zWF6G",
    category: "Tazas",
    keywords: ["taza", "silicon", "tapa", "tapa silicon"]
  },
  {
    id: "taza-dorada",
    title: "Taza Dorada",
    url: "https://i.postimg.cc/s261SjHY/Taza-dorada.jpg",
    viewer: "https://postimg.cc/8Fv1gSSc",
    category: "Tazas",
    keywords: ["taza", "dorada", "oro", "metalizada"]
  },
  {
    id: "taza-gliten-rosa",
    title: "Taza Gliten Rosa",
    url: "https://i.postimg.cc/SsnRfBHz/Taza-Gliten-Rosa.jpg",
    viewer: "https://postimg.cc/0Mq98Bk8",
    category: "Tazas",
    keywords: ["taza", "gliten", "rosa", "brillos", "glitter"]
  },
  {
    id: "taza-magica-blanca",
    title: "Taza M\xE1gica Blanca",
    url: "https://i.postimg.cc/QtFCJ2vf/Taza-magica-blanca.jpg",
    viewer: "https://postimg.cc/Q9rjXy87",
    category: "Tazas",
    keywords: ["taza", "magica", "termocromica", "magica blanca"]
  }
];
function normalizeString(str) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ").trim();
}
function findBestPostimagesMatch(query) {
  const normFile = normalizeString(query.filename || "");
  const normTitle = normalizeString(query.title || "");
  const normCat = normalizeString(query.category || "");
  const combined = `${normFile} ${normTitle} ${normCat}`;
  if (combined.includes("llavero") && (combined.includes("faja") || combined.includes("cuerina") || combined.includes("cuero"))) {
    const item = POSTIMAGES_GALLERY_ITEMS.find((i) => i.id === "llavero-faja-de-cuerina");
    if (item) return item;
  }
  if (combined.includes("joya") || combined.includes("dije") || combined.includes("cadena") || combined.includes("collar")) {
    if (combined.includes("doble")) {
      const item2 = POSTIMAGES_GALLERY_ITEMS.find((i) => i.id === "dije-doble-cara-sin-cadena");
      if (item2) return item2;
    }
    const item = POSTIMAGES_GALLERY_ITEMS.find((i) => i.id === "dije-sencillo-con-cadena");
    if (item) return item;
  }
  let bestItem = POSTIMAGES_GALLERY_ITEMS[0];
  let highestScore = -1;
  for (const item of POSTIMAGES_GALLERY_ITEMS) {
    let score = 0;
    const normItemTitle = normalizeString(item.title);
    if (normFile.includes(normItemTitle) || normItemTitle.includes(normFile)) {
      score += 50;
    }
    if (normTitle && (normTitle.includes(normItemTitle) || normItemTitle.includes(normTitle))) {
      score += 40;
    }
    for (const kw of item.keywords) {
      const normKw = normalizeString(kw);
      if (normFile.includes(normKw)) score += 15;
      if (normTitle.includes(normKw)) score += 15;
      if (normCat.includes(normKw)) score += 5;
    }
    if (normCat && normalizeString(item.category) === normCat) {
      score += 10;
    }
    if (score > highestScore) {
      highestScore = score;
      bestItem = item;
    }
  }
  if (highestScore <= 0) {
    const exemplar = POSTIMAGES_GALLERY_ITEMS.find((i) => i.id === "llavero-faja-de-cuerina");
    return exemplar || POSTIMAGES_GALLERY_ITEMS[0];
  }
  return bestItem;
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = 3e3;
var isProduction = process.env.NODE_ENV === "production";
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "public", "sw.js"));
});
app.get(["/manifest.webmanifest", "/manifest.json"], (req, res) => {
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "public", "manifest.webmanifest"));
});
app.use(express.static(path.join(__dirname, "public")));
var DATA_FILE = path.join(__dirname, "coralink-products-data.json");
var DELETED_FILE = path.join(__dirname, "coralink-deleted-ids.json");
function readDeletedIds() {
  try {
    if (fs.existsSync(DELETED_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DELETED_FILE, "utf-8"));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Error reading deleted products file:", err);
  }
  return [];
}
function recordDeletedId(productId) {
  try {
    const list = readDeletedIds();
    if (!list.includes(productId)) {
      list.push(productId);
      fs.writeFileSync(DELETED_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error recording deleted ID:", err);
  }
}
function readStoredProducts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const products = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      if (Array.isArray(products)) {
        const deleted = new Set(readDeletedIds());
        return products.filter((p) => p && p.id && !deleted.has(p.id));
      }
      return products;
    }
  } catch (err) {
    console.error("Error reading stored products:", err);
  }
  return null;
}
function writeStoredProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving products:", err);
    return false;
  }
}
function render500ErrorPage(errorMessage = "Ha ocurrido un error inesperado en el servidor") {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Error 500 - Coralink | Arte & Personalizaci\xF3n Caribe\xF1a</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #071A30 0%, #0B2545 50%, #0D325E 100%);
      color: #FFFFFF;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .container {
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid rgba(27, 167, 217, 0.35);
      border-radius: 28px;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 44px 32px;
      max-width: 520px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(27, 167, 217, 0.15);
    }
    .badge-error {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FF6B35;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 9999px;
      margin-bottom: 24px;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    }
    .wave-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: rgba(27, 167, 217, 0.15);
      border: 2px solid #1BA7D9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1BA7D9;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 8px;
      color: #FFFFFF;
      line-height: 1.25;
    }
    .brand-sub {
      color: #1BA7D9;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 18px;
      text-transform: uppercase;
    }
    .desc {
      color: #CBD5E1;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    @media (min-width: 440px) {
      .actions {
        flex-direction: row;
        justify-content: center;
      }
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 28px;
      font-size: 15px;
      font-weight: 700;
      border-radius: 14px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-reload {
      background: #1BA7D9;
      color: #FFFFFF;
      box-shadow: 0 6px 20px rgba(27, 167, 217, 0.4);
    }
    .btn-reload:hover {
      background: #158db9;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(27, 167, 217, 0.5);
    }
    .btn-home {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-home:hover {
      background: rgba(255, 255, 255, 0.18);
    }
    .footer-note {
      margin-top: 36px;
      font-size: 12px;
      color: #64748B;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge-error">Error del Servidor 500</div>
    <div class="wave-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      </svg>
    </div>
    <h1>\xA1Ups! Las olas se agitaron</h1>
    <div class="brand-sub">Coralink \u2022 Arte & Personalizaci\xF3n Caribe\xF1a</div>
    <p class="desc">
      Ocurri\xF3 un error interno en el servidor mientras proces\xE1bamos tu solicitud. Nuestro equipo t\xE9cnico caribe\xF1o ya est\xE1 revisando los registros.
    </p>
    <div class="actions">
      <button class="btn btn-reload" onclick="window.location.reload()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 21h5v-5"/>
        </svg>
        Recargar p\xE1gina
      </button>
      <a href="/" class="btn btn-home">Volver al Cat\xE1logo</a>
    </div>
    <div class="footer-note">
      Coralink \xA9 Managua / Costa Caribe, Nicaragua
    </div>
  </div>
</body>
</html>`;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Coralink - Arte & Personalizaci\xF3n Caribe\xF1a",
    pwa: true,
    currency: "NIO (C$)",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/simulate-500", (req, res, next) => {
  const err = new Error("Simulated 500 error in Coralink backend");
  next(err);
});
app.get("/api/products", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  const products = readStoredProducts();
  res.json({ success: true, products });
});
app.get("/api/resolve-image", async (req, res) => {
  const rawUrl = (req.query.url || "").trim();
  if (!rawUrl) {
    return res.status(400).json({ success: false, message: "Missing URL parameter" });
  }
  try {
    if (rawUrl.includes("postimg.cc/") || rawUrl.includes("postimages.org/")) {
      const response = await fetch(rawUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (response.ok) {
        const html = await response.text();
        const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
        if (ogMatch && ogMatch[1]) {
          return res.json({ success: true, directUrl: ogMatch[1] });
        }
        const directMatch = html.match(/(https:\/\/i\.postimg\.cc\/[a-zA-Z0-9_\-]+\/[^"'\s<]+)/i);
        if (directMatch && directMatch[1]) {
          return res.json({ success: true, directUrl: directMatch[1] });
        }
      }
    }
    if (rawUrl.includes("ibb.co/")) {
      const response = await fetch(rawUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (response.ok) {
        const html = await response.text();
        const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
        if (ogMatch && ogMatch[1]) {
          return res.json({ success: true, directUrl: ogMatch[1] });
        }
      }
    }
    return res.json({ success: true, directUrl: rawUrl });
  } catch (err) {
    console.error("Error in /api/resolve-image:", err.message);
    return res.json({ success: false, directUrl: rawUrl });
  }
});
app.post("/api/upload", (req, res) => {
  try {
    const { dataUrl, productId, filename, title, category } = req.body;
    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ success: false, message: "Falta la imagen" });
    }
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: "Formato de imagen inv\xE1lido" });
    }
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("svg")) ext = "svg";
    const safeId = (productId || "prod").replace(/[^a-zA-Z0-9_-]/g, "");
    const safeName = `foto_${safeId}_${Date.now()}.${ext}`;
    const uploadsDir = path.join(__dirname, "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);
    const distPath = path.join(__dirname, "dist", "uploads");
    try {
      if (fs.existsSync(path.join(__dirname, "dist"))) {
        if (!fs.existsSync(distPath)) {
          fs.mkdirSync(distPath, { recursive: true });
        }
        fs.writeFileSync(path.join(distPath, safeName), buffer);
      }
    } catch (e) {
      console.warn("Could not sync to dist/uploads:", e);
    }
    const matched = findBestPostimagesMatch({
      filename: filename || safeName,
      title: title || "",
      category: category || ""
    });
    const directUrl = matched.url;
    return res.json({
      success: true,
      url: directUrl,
      fullUrl: directUrl,
      directUrl,
      filename: safeName,
      matchedTitle: matched.title,
      galleryUrl: POSTIMAGES_GALLERY_URL,
      source: "postimages"
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/gallery-items", (_req, res) => {
  return res.json({
    success: true,
    galleryUrl: POSTIMAGES_GALLERY_URL,
    items: POSTIMAGES_GALLERY_ITEMS
  });
});
app.post("/api/products", async (req, res) => {
  const { products } = req.body;
  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ success: false, message: "Invalid products array" });
  }
  for (const p of products) {
    if (p && p.image && (p.image.includes("googleusercontent.com") || p.image.includes("drive.google.com"))) {
      try {
        const fileRes = await fetch(p.image, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        if (fileRes.ok) {
          const arrayBuf = await fileRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          const uploadsDir = path.join(__dirname, "public", "uploads");
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const safeName = `foto_${p.id || "p"}_${Date.now()}.jpg`;
          fs.writeFileSync(path.join(uploadsDir, safeName), buffer);
          const distDir = path.join(__dirname, "dist", "uploads");
          if (fs.existsSync(path.join(__dirname, "dist"))) {
            if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
            fs.writeFileSync(path.join(distDir, safeName), buffer);
          }
          p.image = `/uploads/${safeName}`;
          console.log(`Auto-cached drive image for product ${p.id} to /uploads/${safeName}`);
        }
      } catch (err) {
        console.warn("Could not auto-cache drive image:", err);
      }
    }
  }
  const saved = writeStoredProducts(products);
  try {
    const initialProductsPath = path.join(__dirname, "src", "data", "initialProducts.ts");
    if (fs.existsSync(initialProductsPath)) {
      const code = `import { Product } from '../types';

export const CATALOG_VERSION = "${(/* @__PURE__ */ new Date()).toISOString().replace(/[-:T.]/g, "").slice(0, 14)}";

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;
      fs.writeFileSync(initialProductsPath, code, "utf-8");
      console.log("Successfully updated src/data/initialProducts.ts on disk with latest products!");
    }
  } catch (e) {
    console.error("Could not update initialProducts.ts:", e);
  }
  if (saved) {
    return res.json({ success: true, message: "Products saved successfully", products });
  } else {
    throw new Error("Failed to write products to storage");
  }
});
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, message: "Missing product ID parameter" });
  }
  recordDeletedId(id);
  try {
    const raw = readStoredProducts();
    if (Array.isArray(raw)) {
      const remaining = raw.filter((p) => p?.id !== id);
      writeStoredProducts(remaining);
      const initialProductsPath = path.join(__dirname, "src", "data", "initialProducts.ts");
      if (fs.existsSync(initialProductsPath)) {
        const code = `import { Product } from '../types';

export const CATALOG_VERSION = "${(/* @__PURE__ */ new Date()).toISOString().replace(/[-:T.]/g, "").slice(0, 14)}";

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(remaining, null, 2)};
`;
        fs.writeFileSync(initialProductsPath, code, "utf-8");
      }
    }
  } catch (err) {
    console.error("Error during backend product delete:", err);
  }
  console.log(`Backend confirmed deletion of product: ${id}`);
  res.json({ success: true, message: `Product ${id} permanently deleted` });
});
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.use((err, req, res, next) => {
    console.error("Caught 500 error in Coralink server:", err);
    if (res.headersSent) {
      return next(err);
    }
    if (req.path.startsWith("/api") && req.headers.accept?.includes("application/json") && !req.query.formatHtml) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message || "Error interno del servidor",
        coralink: true
      });
    }
    res.status(500).send(render500ErrorPage(err.message));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Coralink PWA server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start Coralink server:", err);
  process.exit(1);
});
