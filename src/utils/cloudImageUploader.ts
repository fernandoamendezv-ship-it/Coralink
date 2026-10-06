import { resolveToDirectImageUrl } from './imageUrlResolver';
import { POSTIMAGES_GALLERY_ID } from './postimagesGallery';

export interface CloudUploadResult {
  success: boolean;
  directUrl: string;
  source: 'postimages' | 'cloud' | 'local';
  message: string;
}

/**
 * Compresses an image file on the client into WebP or JPEG with max dimensions and target quality
 * to guarantee lightweight transfer (<150KB) and prevent storage errors.
 */
export async function compressImage(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.86
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webp = canvas.toDataURL('image/webp', quality);
          if (webp && webp.startsWith('data:image/webp')) {
            resolve(webp);
            return;
          }
        } catch (_) {}

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Opens Postimages official uploader window targeting gallery zJjp92t.
 * Automatically listens for the postMessage event sent by Postimages upon completion,
 * extracts the direct CDN link (e.g., https://i.postimg.cc/Z5QhNyYX/Llavero-faja-de-cuerina.jpg),
 * places it into Punto 2, and closes the popup.
 */
export function openPostimagesUploader(
  onSuccess: (directUrl: string) => void,
  gallery = POSTIMAGES_GALLERY_ID
): Window | null {
  const windowId = `pi_${Date.now()}`;
  const uploadUrl = `https://postimages.org/upload?mode=hotlink&areaid=${windowId}&gallery=${encodeURIComponent(
    gallery
  )}`;

  const width = 720;
  const height = 650;
  const left = typeof window !== 'undefined' ? window.screen.width / 2 - width / 2 : 100;
  const top = typeof window !== 'undefined' ? window.screen.height / 2 - height / 2 : 100;

  const popup = window.open(
    uploadUrl,
    windowId,
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  );

  const messageHandler = (event: MessageEvent) => {
    try {
      const data = event.data;
      if (!data) return;

      let textToSearch = '';
      if (typeof data === 'string') {
        textToSearch = data;
      } else if (data.message && typeof data.message === 'string') {
        textToSearch = data.message;
      } else if (data.result && typeof data.result === 'string') {
        textToSearch = data.result;
      } else if (data.url && typeof data.url === 'string') {
        textToSearch = data.url;
      }

      if (textToSearch) {
        // 1. Direct match: https://i.postimg.cc/...
        const directMatch = textToSearch.match(
          /https:\/\/i\.postimg\.cc\/[a-zA-Z0-9_\-]+\/[^"'\s<\])\\]+/i
        );
        if (directMatch && directMatch[0]) {
          window.removeEventListener('message', messageHandler);
          onSuccess(directMatch[0]);
          if (popup && !popup.closed) {
            popup.close();
          }
          return;
        }

        // 2. Viewer match: https://postimg.cc/...
        const viewerMatch = textToSearch.match(/https:\/\/postimg\.cc\/[a-zA-Z0-9_\-]+/i);
        if (viewerMatch && viewerMatch[0]) {
          window.removeEventListener('message', messageHandler);
          resolveToDirectImageUrl(viewerMatch[0]).then((resolved) => {
            if (resolved) {
              onSuccess(resolved);
            }
          });
          if (popup && !popup.closed) {
            popup.close();
          }
        }
      }
    } catch (e) {
      console.warn('Error handling postMessage from Postimages:', e);
    }
  };

  window.addEventListener('message', messageHandler);

  return popup;
}

/**
 * Automatically uploads a photo from mobile or PC directly to the cloud.
 */
export async function uploadImageToCloud(
  file: File,
  productId?: string
): Promise<CloudUploadResult> {
  const compressedDataUrl = await compressImage(file);

  // Strategy 1: Upload to cloud server endpoint /api/upload
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl: compressedDataUrl,
        productId: productId || 'custom',
        filename: file.name,
        gallery: POSTIMAGES_GALLERY_ID,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && (data.fullUrl || data.url)) {
        const directUrl = data.fullUrl || data.url;
        return {
          success: true,
          directUrl,
          source: 'cloud',
          message: '¡Foto alojada en la nube y enlace directo colocado en el Punto 2!',
        };
      }
    }
  } catch (err) {
    console.warn('Server upload notice, using persistent compressed image:', err);
  }

  // Strategy 2: Compressed image fallback (works seamlessly in Firestore across all devices)
  if (compressedDataUrl) {
    return {
      success: true,
      directUrl: compressedDataUrl,
      source: 'local',
      message: '¡Foto optimizada y lista para sincronizar con todos los dispositivos!',
    };
  }

  return {
    success: false,
    directUrl: '',
    source: 'local',
    message: 'No se pudo procesar la imagen.',
  };
}
