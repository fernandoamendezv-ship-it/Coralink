/**
 * Utility to make ANY image link functional across all browsers and devices.
 * Supports Postimages, Google Drive, ImgBB, Dropbox, Imgur, BBCode, HTML tags, and clean URLs.
 */

/**
 * Synchronously converts known service URLs (Google Drive, Dropbox, Imgur, BBCode, HTML)
 * into raw direct image URLs.
 */
export function formatDirectImageUrl(input: string): string {
  if (!input) return '';
  let url = input.trim();

  // 1. Strip BBCode: [img]...[/img] or [url=...][img]...[/img][/url]
  const bbCodeMatch = url.match(/\[img\](.*?)\[\/img\]/i);
  if (bbCodeMatch && bbCodeMatch[1]) {
    url = bbCodeMatch[1].trim();
  }

  // 2. Strip HTML tags: <img src="..." /> or <a ...><img src="..." /></a>
  const htmlMatch = url.match(/src=["'](.*?)["']/i);
  if (htmlMatch && htmlMatch[1]) {
    url = htmlMatch[1].trim();
  }

  // 3. Strip Markdown: ![alt](url)
  const mdMatch = url.match(/!\[.*?\]\((.*?)\)/);
  if (mdMatch && mdMatch[1]) {
    url = mdMatch[1].trim();
  }

  // 4. Clean extra surrounding quotes or brackets
  url = url.replace(/^["'<(\[]+|["'>)\]]+$/g, '').trim();

  // 5. Google Drive Links: convert to high-speed Google UserContent direct CDN
  // Formats:
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  const gDriveMatch =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
    url.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/i);

  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 6. Dropbox Links: convert to direct raw download
  // https://www.dropbox.com/s/.../foto.jpg?dl=0 -> ?raw=1
  if (url.includes('dropbox.com')) {
    url = url.replace(/[?&]dl=[01]/, '');
    url += (url.includes('?') ? '&' : '?') + 'raw=1';
    return url;
  }

  // 7. Imgur Links:
  // https://imgur.com/XYZ -> https://i.imgur.com/XYZ.jpg
  const imgurMatch = url.match(/imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]{5,8})(?:\.[a-z]+)?$/i);
  if (imgurMatch && imgurMatch[1] && !url.includes('i.imgur.com')) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  // 8. OneDrive direct links
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    if (!url.includes('download=1')) {
      url += (url.includes('?') ? '&' : '?') + 'download=1';
    }
    return url;
  }

  return url;
}

/**
 * Checks if a URL is a viewer page that requires resolving (like postimg.cc/XYZ or ibb.co/XYZ).
 */
export function isViewerPageUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  // postimg.cc without 'i.postimg.cc'
  if (trimmed.includes('postimg.cc/') && !trimmed.includes('i.postimg.cc/')) {
    return true;
  }
  // postimages.org
  if (trimmed.includes('postimages.org/')) {
    return true;
  }
  // ibb.co without 'i.ibb.co'
  if (trimmed.includes('ibb.co/') && !trimmed.includes('i.ibb.co/')) {
    return true;
  }
  return false;
}

/**
 * Resolves any image URL to a 100% direct, browser-renderable image link.
 * If it is a Postimages viewer page (postimg.cc/XYZ) or ImgBB page (ibb.co/XYZ),
 * it asks the backend API `/api/resolve-image` to extract the true direct URL.
 */
export async function resolveToDirectImageUrl(rawInput: string): Promise<string> {
  if (!rawInput) return '';

  // First pass: synchronous pattern conversions (Drive, Dropbox, Imgur, BBCode, HTML)
  const formatted = formatDirectImageUrl(rawInput);

  // If it's a viewer page (Postimages or ImgBB), query the backend resolver
  if (isViewerPageUrl(formatted)) {
    try {
      const res = await fetch(`/api/resolve-image?url=${encodeURIComponent(formatted)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.directUrl) {
          return data.directUrl;
        }
      }
    } catch (err) {
      console.warn('Backend image resolution error:', err);
    }
  }

  return formatted;
}

/**
 * Tests whether an image URL loads successfully in the browser.
 */
export function testImageUrl(url: string, timeoutMs = 4500): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      resolve(false);
      return;
    }

    const img = new Image();
    let isDone = false;

    img.onload = () => {
      if (!isDone) {
        isDone = true;
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!isDone) {
        isDone = true;
        resolve(false);
      }
    };

    setTimeout(() => {
      if (!isDone) {
        isDone = true;
        resolve(false);
      }
    }, timeoutMs);

    img.src = url;
  });
}
