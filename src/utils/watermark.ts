import { CORALINK_FALLBACK_LOGO_URL, CORALINK_LOGO_URL } from './logoConstants';

export interface WatermarkOptions {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'center';
  opacity?: number;
  scale?: number; // ratio relative to image width, default ~0.22
  includeBrandBackdrop?: boolean;
}

let cachedLogoImg: HTMLImageElement | null = null;
let logoLoadPromise: Promise<HTMLImageElement> | null = null;

/**
 * Pre-loads the official Coralink logo into an HTMLImageElement with crossOrigin support.
 */
export function preloadLogoImage(): Promise<HTMLImageElement> {
  if (cachedLogoImg && cachedLogoImg.complete && cachedLogoImg.naturalWidth > 0) {
    return Promise.resolve(cachedLogoImg);
  }
  if (logoLoadPromise) {
    return logoLoadPromise;
  }

  logoLoadPromise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      cachedLogoImg = img;
      resolve(img);
    };

    img.onerror = () => {
      // Fallback to online Postimages CDN logo
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        cachedLogoImg = fallbackImg;
        resolve(fallbackImg);
      };
      fallbackImg.onerror = () => {
        // As an emergency fallback, resolve original
        resolve(img);
      };
      fallbackImg.src = CORALINK_LOGO_URL;
    };

    // Primary: local public/LG1.png
    img.src = CORALINK_FALLBACK_LOGO_URL;
  });

  return logoLoadPromise;
}

/**
 * Draws a rounded rectangle path on any canvas 2D context with full browser support.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Applies the official Coralink logo watermark directly onto a Canvas element.
 */
export async function applyWatermarkToCanvas(
  canvas: HTMLCanvasElement,
  options: WatermarkOptions = {}
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const logo = await preloadLogoImage();
  if (!logo || !logo.naturalWidth) return;

  const {
    position = 'bottom-right',
    opacity = 0.92,
    scale = 0.22,
    includeBrandBackdrop = true,
  } = options;

  const w = canvas.width;
  const h = canvas.height;

  // Calculate proportional watermark size
  // Coralink LG1 natural aspect ratio: 970 / 707 ≈ 1.37
  const logoAspect = (logo.naturalWidth || 970) / (logo.naturalHeight || 707);
  let targetWidth = Math.max(76, Math.min(Math.round(w * scale), 230));
  let targetHeight = Math.round(targetWidth / logoAspect);

  // Safety bounds
  if (targetHeight > h * 0.28) {
    targetHeight = Math.round(h * 0.28);
    targetWidth = Math.round(targetHeight * logoAspect);
  }

  const margin = Math.max(12, Math.round(w * 0.025));

  let x = w - targetWidth - margin;
  let y = h - targetHeight - margin;

  if (position === 'bottom-left') {
    x = margin;
    y = h - targetHeight - margin;
  } else if (position === 'top-right') {
    x = w - targetWidth - margin;
    y = margin;
  } else if (position === 'center') {
    x = Math.round((w - targetWidth) / 2);
    y = Math.round((h - targetHeight) / 2);
  }

  ctx.save();

  if (includeBrandBackdrop) {
    const padX = Math.round(targetWidth * 0.07);
    const padY = Math.round(targetHeight * 0.07);
    const pillX = x - padX;
    const pillY = y - padY;
    const pillW = targetWidth + padX * 2;
    const pillH = targetHeight + padY * 2;
    const radius = Math.max(8, Math.round(pillH * 0.18));

    // 1. Soft drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // 2. Frosted glass brand backdrop (Coralink Deep Navy with transparency)
    ctx.fillStyle = 'rgba(11, 37, 69, 0.62)';
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, radius);
    ctx.fill();

    // 3. Subtle translucent border
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // Draw the logo with opacity
  ctx.globalAlpha = opacity;
  ctx.drawImage(logo, x, y, targetWidth, targetHeight);

  ctx.restore();
}

/**
 * Loads an image from File, URL, or DataURL, applies dimensions and the official Coralink
 * watermark logo, and returns a high-quality compressed WebP/JPEG DataURL.
 */
export async function applyWatermarkToImage(
  source: File | string,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.88,
  options: WatermarkOptions = {}
): Promise<string> {
  let dataUrl = '';

  if (source instanceof File) {
    dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(source);
    });
  } else if (typeof source === 'string') {
    dataUrl = source;
  }

  if (!dataUrl) return '';

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      let width = img.width;
      let height = img.height;

      // Scale dimensions if necessary
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // 1. Draw base photo
      ctx.drawImage(img, 0, 0, width, height);

      // 2. Apply Coralink official watermark logo
      try {
        await applyWatermarkToCanvas(canvas, options);
      } catch (err) {
        console.warn('Notice applying watermark:', err);
      }

      // 3. Export as lightweight WebP with JPEG fallback
      try {
        const webp = canvas.toDataURL('image/webp', quality);
        if (webp && webp.startsWith('data:image/webp')) {
          resolve(webp);
          return;
        }
      } catch (_) {}

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      console.warn('Could not load image to apply watermark');
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
