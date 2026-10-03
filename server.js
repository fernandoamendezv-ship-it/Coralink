// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var isProduction = process.env.NODE_ENV === "production";
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
var DATA_FILE = path.join(__dirname, "coralink-products-data.json");
function readStoredProducts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
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
    const { dataUrl, productId } = req.body;
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
    const url = `/uploads/${safeName}`;
    return res.json({ success: true, url, filename: safeName });
  } catch (err) {
    console.error("Error uploading image:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
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
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {}
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
