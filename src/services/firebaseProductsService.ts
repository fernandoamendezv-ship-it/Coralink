import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { findBestPostimagesMatch } from '../utils/postimagesGallery';
import { getDeletedProductIds } from '../utils/productMerger';

const PRODUCTS_COLLECTION = 'products';

/**
 * Sanitizes image URL so that local dev URLs (like localhost:3000) are never
 * persisted or shown on mobile/other devices. They resolve directly to Postimages.
 */
function sanitizeProductImage(img?: string, title?: string, category?: string): string {
  if (!img) return '';
  if (img.includes('localhost') || img.includes('127.0.0.1')) {
    const match = findBestPostimagesMatch({ title, category });
    return match.url;
  }
  return img;
}

/**
 * Subscribes to real-time updates for all products in Firestore.
 * Automatically synchronizes changes across all devices without page refresh.
 */
export function subscribeToFirebaseProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    if (!db) {
      console.warn('Firestore database is not initialized yet');
      return () => {};
    }
    const colRef = collection(db, PRODUCTS_COLLECTION);

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // First-time run: if collection is empty, seed with initial catalog
          seedCatalogIfEmpty().then((seeded) => {
            if (seeded && seeded.length > 0) {
              onUpdate(seeded);
            }
          });
          return;
        }

        const products: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<Product>;
          if (data && data.id) {
            products.push({
              id: data.id,
              title: data.title || '',
              mainCategory: data.mainCategory || 'Personalizados',
              subCategory: data.subCategory || 'General',
              price: typeof data.price === 'number' ? data.price : 0,
              originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : undefined,
              image: sanitizeProductImage(data.image, data.title, data.mainCategory),
              description: data.description || '',
              inStock: data.inStock !== false,
              featured: Boolean(data.featured),
              isFlashDeal: Boolean(data.isFlashDeal),
              badge: data.badge || undefined,
              rating: typeof data.rating === 'number' ? data.rating : 5.0,
              reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 24,
              salesCount: typeof data.salesCount === 'number' ? data.salesCount : 60,
              availableOptions: Array.isArray(data.availableOptions) ? data.availableOptions : undefined,
            });
          }
        });

        // Preserve catalog order based on ID or index
        products.sort((a, b) => {
          const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
          return numA - numB;
        });

        onUpdate(products);
      },
      (err) => {
        console.warn('Firestore real-time listener notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to attach Firestore listener:', err);
    return () => {};
  }
}

/**
 * One-time manual fetch of all products from Firestore (no persistent socket listener).
 * Automatically purges and filters any products registered as deleted.
 */
export async function fetchProductsFromFirestore(customDeletedIds?: Set<string>): Promise<Product[] | null> {
  try {
    if (!db) return null;
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) return null;

    const delSet = customDeletedIds || getDeletedProductIds();
    const products: Product[] = [];
    const idsToPurge: string[] = [];

    snap.forEach((docSnap) => {
      const docId = docSnap.id;
      if (delSet.has(docId)) {
        idsToPurge.push(docId);
        return;
      }

      const data = docSnap.data() as Partial<Product>;
      if (data && data.id) {
        if (delSet.has(data.id)) {
          idsToPurge.push(data.id);
          return;
        }

        products.push({
          id: data.id,
          title: data.title || '',
          mainCategory: data.mainCategory || 'Personalizados',
          subCategory: data.subCategory || 'General',
          price: typeof data.price === 'number' ? data.price : 0,
          originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : undefined,
          image: sanitizeProductImage(data.image, data.title, data.mainCategory),
          description: data.description || '',
          inStock: data.inStock !== false,
          featured: Boolean(data.featured),
          isFlashDeal: Boolean(data.isFlashDeal),
          badge: data.badge || undefined,
          rating: typeof data.rating === 'number' ? data.rating : 5.0,
          reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 24,
          salesCount: typeof data.salesCount === 'number' ? data.salesCount : 60,
          availableOptions: Array.isArray(data.availableOptions) ? data.availableOptions : undefined,
        });
      }
    });

    // Asynchronously delete any phantom records from Firestore
    if (idsToPurge.length > 0) {
      idsToPurge.forEach((id) => {
        deleteProductFromFirestore(id).catch(() => {});
      });
    }

    products.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    return products;
  } catch (err) {
    console.warn('fetchProductsFromFirestore notice:', err);
    return null;
  }
}

/**
 * Saves or updates a single product in Firestore in real-time.
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    if (!db) return;
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const cleanData: Record<string, any> = {
      id: product.id,
      title: product.title.trim(),
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
      price: Number(product.price) || 0,
      image: sanitizeProductImage(product.image, product.title, product.mainCategory),
      description: product.description || '',
      inStock: Boolean(product.inStock),
      rating: product.rating ?? 5.0,
      reviewsCount: product.reviewsCount ?? 24,
      salesCount: product.salesCount ?? 60,
      updatedAt: new Date().toISOString(),
    };

    if (product.originalPrice !== undefined) {
      cleanData.originalPrice = Number(product.originalPrice);
    }
    if (product.featured !== undefined) {
      cleanData.featured = Boolean(product.featured);
    }
    if (product.isFlashDeal !== undefined) {
      cleanData.isFlashDeal = Boolean(product.isFlashDeal);
    }
    if (product.badge !== undefined) {
      cleanData.badge = product.badge;
    }
    if (product.availableOptions) {
      cleanData.availableOptions = product.availableOptions;
    }

    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.warn('saveProductToFirestore error:', err);
  }
}

/**
 * Deletes a product from Firestore in real-time.
 */
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('deleteProductFromFirestore error:', err);
    return false;
  }
}

/**
 * Seeds the initial catalog into Firestore if the collection is empty.
 */
export async function seedCatalogIfEmpty(): Promise<Product[] | null> {
  try {
    if (!db) return null;
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return null;
    }

    console.log('Seeding initial catalog to Firestore...');
    const batch = writeBatch(db);
    INITIAL_PRODUCTS.forEach((product) => {
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
      const cleanData: Record<string, any> = {
        id: product.id,
        title: product.title,
        mainCategory: product.mainCategory,
        subCategory: product.subCategory,
        price: product.price,
        image: product.image,
        description: product.description || '',
        inStock: product.inStock,
        rating: product.rating ?? 5.0,
        reviewsCount: product.reviewsCount ?? 24,
        salesCount: product.salesCount ?? 60,
        updatedAt: new Date().toISOString(),
      };
      if (product.originalPrice) cleanData.originalPrice = product.originalPrice;
      if (product.featured) cleanData.featured = product.featured;
      if (product.isFlashDeal !== undefined) cleanData.isFlashDeal = product.isFlashDeal;
      if (product.badge) cleanData.badge = product.badge;
      if (product.availableOptions) cleanData.availableOptions = product.availableOptions;

      batch.set(docRef, cleanData);
    });

    await batch.commit();
    console.log('Catalog successfully seeded to Firestore!');
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('Failed to seed catalog to Firestore:', err);
    return null;
  }
}

/**
 * Batch saves updated products array to Firestore, strictly purging any deleted products.
 */
export async function syncAllProductsToFirestore(
  products: Product[],
  explicitDeletedId?: string
): Promise<void> {
  try {
    if (!db) return;
    const deletedIds = getDeletedProductIds();
    if (explicitDeletedId) {
      deletedIds.add(explicitDeletedId);
    }

    const validProducts = (products || []).filter(
      (p) => p && p.id && !deletedIds.has(p.id)
    );

    const chunkSize = 400;
    for (let i = 0; i < validProducts.length; i += chunkSize) {
      const chunk = validProducts.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      chunk.forEach((product) => {
        const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
        const cleanData: Record<string, any> = {
          id: product.id,
          title: product.title,
          mainCategory: product.mainCategory,
          subCategory: product.subCategory,
          price: product.price,
          image: product.image,
          description: product.description || '',
          inStock: Boolean(product.inStock),
          rating: product.rating ?? 5.0,
          reviewsCount: product.reviewsCount ?? 24,
          salesCount: product.salesCount ?? 60,
          updatedAt: new Date().toISOString(),
        };
        if (product.originalPrice) cleanData.originalPrice = product.originalPrice;
        if (product.featured) cleanData.featured = product.featured;
        if (product.isFlashDeal !== undefined) cleanData.isFlashDeal = product.isFlashDeal;
        if (product.badge) cleanData.badge = product.badge;
        if (product.availableOptions) cleanData.availableOptions = product.availableOptions;

        batch.set(docRef, cleanData, { merge: true });
      });

      await batch.commit();
    }

    // Explicitly purge any deleted products from Firestore
    if (deletedIds.size > 0) {
      for (const delId of deletedIds) {
        try {
          await deleteDoc(doc(db, PRODUCTS_COLLECTION, delId));
        } catch {}
      }
    }
  } catch (err) {
    console.error('Failed to sync products to Firestore:', err);
  }
}
