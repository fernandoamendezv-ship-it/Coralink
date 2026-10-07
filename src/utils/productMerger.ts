import { Product } from '../types';
import { isReferenceLogo, CORALINK_LOGO_URL } from './logoConstants';
import { formatDirectImageUrl } from './imageUrlResolver';

const DELETED_PRODUCTS_KEY = 'coralink_deleted_product_ids';

/**
 * Retrieves the set of permanently deleted product IDs from localStorage.
 */
export function getDeletedProductIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(
          parsed.filter((id) => typeof id === 'string' && id.trim().length > 0)
        );
      }
    }
  } catch (e) {
    console.warn('Error reading deleted products set:', e);
  }
  return new Set();
}

/**
 * Permanently registers a product ID as deleted, cleaning it across all
 * browser caches, carts, backups, and favorites so it NEVER resurrects.
 */
export function markProductAsDeleted(productId: string): void {
  if (typeof window === 'undefined' || !productId) return;
  try {
    const deleted = getDeletedProductIds();
    deleted.add(productId);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(deleted)));

    // Clean from custom products storage
    const cleanList = (key: string) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const filtered = list.filter((p: any) => p?.id !== productId);
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {}
      }
    };
    cleanList('coralink_custom_products');
    cleanList('coralink_custom_products_backup');

    // Clean from session storage
    try {
      const rawSession = sessionStorage.getItem('coralink_custom_products');
      if (rawSession) {
        const list = JSON.parse(rawSession);
        if (Array.isArray(list)) {
          const filtered = list.filter((p: any) => p?.id !== productId);
          sessionStorage.setItem('coralink_custom_products', JSON.stringify(filtered));
        }
      }
    } catch {}

    // Clean from cart so cart snapshots cannot restore deleted product
    try {
      const rawCart = localStorage.getItem('coralink_cart');
      if (rawCart) {
        const cart = JSON.parse(rawCart);
        if (Array.isArray(cart)) {
          const filtered = cart.filter((item: any) => item?.product?.id !== productId);
          localStorage.setItem('coralink_cart', JSON.stringify(filtered));
        }
      }
    } catch {}

    // Clean from favorites
    try {
      const rawFav = localStorage.getItem('coralink_favorites');
      if (rawFav) {
        const favs = JSON.parse(rawFav);
        if (Array.isArray(favs)) {
          const filtered = favs.filter((id: string) => id !== productId);
          localStorage.setItem('coralink_favorites', JSON.stringify(filtered));
        }
      }
    } catch {}
  } catch (e) {
    console.warn('Error marking product as deleted:', e);
  }
}

/**
 * Filters out all products whose IDs are registered as deleted.
 */
export function filterOutDeletedProducts(products: Product[]): Product[] {
  if (!Array.isArray(products)) return [];
  const deleted = getDeletedProductIds();
  if (deleted.size === 0) return products;
  return products.filter((p) => p && p.id && !deleted.has(p.id));
}

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

  // Check if badge or inStock or isFlashDeal was altered
  if (product.badge !== defaultProduct.badge) return true;
  if (product.inStock !== defaultProduct.inStock) return true;
  if (Boolean(product.isFlashDeal) !== Boolean(defaultProduct.isFlashDeal)) return true;

  return false;
}

/**
 * Merges existing products with default products, strictly obeying:
 * 1. Deleted products are NEVER resurrected.
 * 2. If the user already has a saved catalog, missing default products that
 *    were deleted or removed are NOT re-added.
 * 3. User customizations (photos, prices, descriptions, stock) are preserved.
 */
export function mergePreservingCustomizations(
  existingProducts: Product[],
  defaultProducts: Product[]
): Product[] {
  const deletedIds = getDeletedProductIds();

  const cleanExisting = Array.isArray(existingProducts)
    ? existingProducts.filter((p) => p && p.id && !deletedIds.has(p.id))
    : [];

  // First time ever: no local storage exists at all
  if (cleanExisting.length === 0) {
    return defaultProducts.filter((p) => !deletedIds.has(p.id));
  }

  // If the user already has an active catalog, use cleanExisting as the base
  // and do NOT resurrect items that are missing (since the user may have deleted them)
  const defaultMap = new Map<string, Product>();
  defaultProducts.forEach((d) => {
    if (d && d.id) defaultMap.set(d.id, d);
  });

  const merged: Product[] = cleanExisting.map((existing) => {
    const def = defaultMap.get(existing.id);
    if (!def) {
      // User-created product
      return {
        ...existing,
        rating: existing.rating ?? 5.0,
        reviewsCount: existing.reviewsCount ?? 24,
        salesCount: existing.salesCount ?? 60,
        image:
          existing.image && !isReferenceLogo(existing.image)
            ? existing.image
            : CORALINK_LOGO_URL,
      };
    }

    const customized = isProductCustomized(existing, def);
    if (customized) {
      const formatted = existing.image ? formatDirectImageUrl(existing.image) : '';
      let finalImage =
        formatted && !isReferenceLogo(formatted) ? formatted : CORALINK_LOGO_URL;

      if (def.image && !isReferenceLogo(def.image) && isReferenceLogo(existing.image)) {
        finalImage = def.image;
      }

      return {
        ...def,
        ...existing,
        rating: existing.rating ?? def.rating ?? 5.0,
        reviewsCount: existing.reviewsCount ?? def.reviewsCount ?? 24,
        salesCount: existing.salesCount ?? 60,
        image: finalImage,
      };
    }

    return {
      ...def,
      ...existing,
    };
  });

  return merged.filter((p) => !deletedIds.has(p.id));
}

/**
 * Deep scan of all browser storage locations to recover any lost customized products
 * (e.g. from previous backups, cart history, or sessionStorage) while strictly
 * filtering out any product that was intentionally deleted.
 */
export function scanAndRecoverCustomProducts(
  defaultProducts: Product[]
): { recoveredProducts: Product[]; customCount: number } {
  const deletedIds = getDeletedProductIds();

  if (typeof window === 'undefined') {
    return {
      recoveredProducts: defaultProducts.filter((p) => !deletedIds.has(p.id)),
      customCount: 0,
    };
  }

  const recoveredMap = new Map<string, Product>();
  let customFound = 0;

  // Helper to ingest and examine a candidate product
  const ingest = (cand: any) => {
    if (!cand || !cand.id || typeof cand.id !== 'string') return;
    if (deletedIds.has(cand.id)) return; // Strictly ignore any deleted product

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
