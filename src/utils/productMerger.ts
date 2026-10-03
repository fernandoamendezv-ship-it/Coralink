import { Product } from '../types';
import { isReferenceLogo, CORALINK_LOGO_URL } from './logoConstants';
import { formatDirectImageUrl } from './imageUrlResolver';

/**
 * Checks whether a product has been customized by the user
 * (custom image, modified price, modified title, description, or custom product ID).
 */
export function isProductCustomized(product: Product, defaultProduct?: Product): boolean {
  if (!product) return false;

  // Custom photo: has an image that is NOT the default reference logo
  const hasCustomPhoto = !!(product.image && !isReferenceLogo(product.image));
  if (hasCustomPhoto) return true;

  if (!defaultProduct) {
    // If not in defaults, it's a completely new product created by the user!
    return true;
  }

  // Check if price was altered
  if (typeof product.price === 'number' && product.price !== defaultProduct.price) {
    return true;
  }

  // Check if title or description was altered
  if (product.title && product.title.trim() !== defaultProduct.title.trim()) {
    return true;
  }
  if (product.description && product.description.trim() !== defaultProduct.description.trim()) {
    return true;
  }

  // Check if badge or inStock was altered
  if (product.badge !== defaultProduct.badge) return true;
  if (product.inStock !== defaultProduct.inStock) return true;

  return false;
}

/**
 * Merges a list of products while strictly preserving user customizations.
 * Any custom photo, custom price, custom title or custom product is NEVER overwritten.
 */
export function mergePreservingCustomizations(
  existingProducts: Product[],
  defaultProducts: Product[]
): Product[] {
  if (!Array.isArray(existingProducts) || existingProducts.length === 0) {
    return defaultProducts;
  }

  const existingMap = new Map<string, Product>();
  const defaultIds = new Set(defaultProducts.map((p) => p.id));

  existingProducts.forEach((p) => {
    if (p && p.id) {
      existingMap.set(p.id, p);
    }
  });

  // Map defaults, preserving customizations
  const merged: Product[] = defaultProducts.map((def) => {
    const existing = existingMap.get(def.id);
    if (!existing) return def;

    const customized = isProductCustomized(existing, def);
    if (customized) {
      const formatted = existing.image ? formatDirectImageUrl(existing.image) : '';
      let finalImage =
        formatted && !isReferenceLogo(formatted)
          ? formatted
          : CORALINK_LOGO_URL;

      // If server has a custom photo and existing local only had the reference logo, use server's photo
      if (def.image && !isReferenceLogo(def.image) && isReferenceLogo(existing.image)) {
        finalImage = def.image;
      }

      return {
        ...def,
        ...existing,
        rating: existing.rating ?? def.rating ?? 5.0,
        reviewsCount: existing.reviewsCount ?? def.reviewsCount ?? 24,
        salesCount: existing.salesCount ?? def.salesCount ?? 60,
        image: finalImage,
      };
    }

    // Not customized: use default product with new logo
    return def;
  });

  // Also preserve any custom products created by user that are not in defaults!
  existingProducts.forEach((p) => {
    if (p && p.id && !defaultIds.has(p.id)) {
      merged.push({
        ...p,
        rating: p.rating ?? 5.0,
        reviewsCount: p.reviewsCount ?? 24,
        salesCount: p.salesCount ?? 60,
        image: p.image && !isReferenceLogo(p.image) ? p.image : CORALINK_LOGO_URL,
      });
    }
  });

  return merged;
}

/**
 * Deep scan of all browser storage locations to recover any lost customized products
 * (e.g. from previous backups, cart history, or sessionStorage).
 */
export function scanAndRecoverCustomProducts(
  defaultProducts: Product[]
): { recoveredProducts: Product[]; customCount: number } {
  if (typeof window === 'undefined') {
    return { recoveredProducts: defaultProducts, customCount: 0 };
  }

  const recoveredMap = new Map<string, Product>();
  let customFound = 0;

  // Helper to ingest and examine a candidate product
  const ingest = (cand: any) => {
    if (!cand || !cand.id || typeof cand.id !== 'string') return;
    const existing = recoveredMap.get(cand.id);

    const hasPhoto = cand.image && !isReferenceLogo(cand.image);
    const existingHasPhoto = existing?.image && !isReferenceLogo(existing.image);

    if (hasPhoto) {
      customFound++;
    }

    if (!existing) {
      recoveredMap.set(cand.id, cand);
    } else if (hasPhoto && !existingHasPhoto) {
      recoveredMap.set(cand.id, { ...existing, ...cand });
    }
  };

  // 1. Primary custom products storage
  try {
    const raw = localStorage.getItem('coralink_custom_products');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) parsed.forEach(ingest);
    }
  } catch (e) {
    console.warn('Error reading coralink_custom_products:', e);
  }

  // 2. Safety backup storage
  try {
    const rawBackup = localStorage.getItem('coralink_custom_products_backup');
    if (rawBackup) {
      const parsed = JSON.parse(rawBackup);
      if (Array.isArray(parsed)) parsed.forEach(ingest);
    }
  } catch (e) {
    console.warn('Error reading coralink_custom_products_backup:', e);
  }

  // 3. Cart storage (items added to cart contain product snapshots)
  try {
    const rawCart = localStorage.getItem('coralink_cart');
    if (rawCart) {
      const cartItems = JSON.parse(rawCart);
      if (Array.isArray(cartItems)) {
        cartItems.forEach((item) => {
          if (item?.product) ingest(item.product);
        });
      }
    }
  } catch (e) {
    console.warn('Error reading coralink_cart:', e);
  }

  // 4. Session storage (in case a tab had an active session)
  try {
    const rawSession = sessionStorage.getItem('coralink_custom_products');
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (Array.isArray(parsed)) parsed.forEach(ingest);
    }
  } catch (e) {
    console.warn('Error reading sessionStorage:', e);
  }

  const existingArray = Array.from(recoveredMap.values());
  const finalMerged = mergePreservingCustomizations(existingArray, defaultProducts);

  return {
    recoveredProducts: finalMerged,
    customCount: customFound,
  };
}
