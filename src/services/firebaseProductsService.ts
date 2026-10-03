import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';

/**
 * Subscribes to real-time updates for all products in Firestore.
 * Automatically synchronizes changes across all devices without page refresh.
 */
export function subscribeToFirebaseProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
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
        const data = docSnap.data() as Product;
        if (data && data.id) {
          products.push({
            id: data.id,
            title: data.title || '',
            mainCategory: data.mainCategory || 'General',
            subCategory: data.subCategory || 'General',
            price: typeof data.price === 'number' ? data.price : 0,
            originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : undefined,
            image: data.image || '',
            description: data.description || '',
            inStock: data.inStock !== false,
            featured: Boolean(data.featured),
            badge: data.badge || undefined,
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
      console.warn('Firestore real-time listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Saves or updates a single product in Firestore in real-time.
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
  const cleanData: Record<string, any> = {
    id: product.id,
    title: product.title.trim(),
    mainCategory: product.mainCategory,
    subCategory: product.subCategory,
    price: Number(product.price) || 0,
    image: product.image,
    description: product.description || '',
    inStock: Boolean(product.inStock),
    updatedAt: new Date().toISOString(),
  };

  if (product.originalPrice !== undefined) {
    cleanData.originalPrice = Number(product.originalPrice);
  }
  if (product.featured !== undefined) {
    cleanData.featured = Boolean(product.featured);
  }
  if (product.badge !== undefined) {
    cleanData.badge = product.badge;
  }

  await setDoc(docRef, cleanData, { merge: true });
}

/**
 * Seeds the initial catalog into Firestore if the collection is empty.
 */
export async function seedCatalogIfEmpty(): Promise<Product[] | null> {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return null;
    }

    console.log('Seeding initial catalog to Firestore...');
    // Firestore batch supports up to 500 operations
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
        updatedAt: new Date().toISOString(),
      };
      if (product.originalPrice) cleanData.originalPrice = product.originalPrice;
      if (product.featured) cleanData.featured = product.featured;
      if (product.badge) cleanData.badge = product.badge;

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
 * Batch saves updated products array to Firestore.
 */
export async function syncAllProductsToFirestore(products: Product[]): Promise<void> {
  try {
    // Process in batches of 400 to respect Firestore 500 batch limit
    const chunkSize = 400;
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
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
          inStock: product.inStock,
          updatedAt: new Date().toISOString(),
        };
        if (product.originalPrice) cleanData.originalPrice = product.originalPrice;
        if (product.featured) cleanData.featured = product.featured;
        if (product.badge) cleanData.badge = product.badge;

        batch.set(docRef, cleanData, { merge: true });
      });

      await batch.commit();
    }
  } catch (err) {
    console.error('Failed to sync products to Firestore:', err);
  }
}
