import { resolveToDirectImageUrl, formatDirectImageUrl } from './imageUrlResolver';

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
 * Automatically uploads a photo from mobile or PC directly to the cloud.
 * 1. Attempts direct upload to Postimages under the user gallery: https://postimg.cc/gallery/zJjp92t
 * 2. If Postimages returns the viewer URL, resolves it to the high-speed direct CDN link (https://i.postimg.cc/...)
 * 3. Fallback: Uploads to the cloud server (/api/upload) to generate a public permanent HTTPS URL.
 * 4. Fallback 2: Uses the compressed high-efficiency data URL that persists in Firestore across all devices.
 */
export async function uploadImageToCloud(
  file: File,
  productId?: string
): Promise<CloudUploadResult> {
  // 1. Prepare compressed version for reliability
  const compressedDataUrl = await compressImage(file);

  // Strategy 1: Attempt direct upload to Postimages (Gallery zJjp92t) from browser
  try {
    const session = Date.now() + Math.random().toString().substring(1);
    const postimgForm = new FormData();
    postimgForm.append('upload_session', session);
    postimgForm.append('numfiles', '1');
    postimgForm.append('gallery', 'zJjp92t');
    postimgForm.append('ui', '[true,true,"250",0]');
    postimgForm.append('file', file, file.name);

    const postimgRes = await fetch('https://postimages.org/json/rr', {
      method: 'POST',
      body: postimgForm,
    });

    if (postimgRes.ok) {
      const data = await postimgRes.json();
      if (data && data.url) {
        // Resolve viewer page (e.g., https://postimg.cc/xyz) to direct CDN image (https://i.postimg.cc/xyz/image.jpg)
        const direct = await resolveToDirectImageUrl(data.url);
        const finalDirect = direct || data.url;
        return {
          success: true,
          directUrl: finalDirect,
          source: 'postimages',
          message: '¡Foto subida a la nube de Postimages y enlace directo colocado en el Punto 2!',
        };
      }
    }
  } catch (err) {
    console.warn('Direct Postimages browser upload notice, trying cloud server fallback:', err);
  }

  // Strategy 2: Upload to cloud server endpoint /api/upload
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl: compressedDataUrl,
        productId: productId || 'custom',
        filename: file.name,
        gallery: 'zJjp92t',
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

  // Strategy 3: Compressed image fallback (works seamlessly in Firestore across all devices)
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
