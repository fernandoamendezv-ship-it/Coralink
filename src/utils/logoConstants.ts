export const CORALINK_LOGO_URL = 'https://i.postimg.cc/4Nkhfnd6/LG1.png';
export const CORALINK_FALLBACK_LOGO_URL = '/LG1.png';

/**
 * Checks whether an image URL is the store's default reference logo or a temporary placeholder.
 */
export function isReferenceLogo(url?: string | null): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  return (
    trimmed === '/LG1.png' ||
    trimmed === '/logos.png' ||
    trimmed === '/logo.png' ||
    trimmed === '/logo-app.svg' ||
    trimmed === '/logo-clean.svg' ||
    trimmed.includes('4Nkhfnd6/LG1.png') ||
    trimmed.includes('unsplash.com')
  );
}

/**
 * Returns either the custom product image or the official new Coralink logo URL.
 */
export function getProductDisplayImage(url?: string | null): string {
  if (isReferenceLogo(url)) {
    return CORALINK_LOGO_URL;
  }
  return url!;
}
