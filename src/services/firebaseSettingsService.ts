import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { PrivacyLegalConfig, DEFAULT_PRIVACY_CONFIG, PRIVACY_STORAGE_KEY } from '../utils/privacyConfig';
import { getDeletedProductIds, markProductAsDeleted } from '../utils/productMerger';

export interface StoreSettings {
  privacyConfig?: Partial<PrivacyLegalConfig>;
  logoUrl?: string;
  enabledCategories?: {
    'Papelería creativa': boolean;
    'Detalles en resina': boolean;
  };
  deletedProductIds?: string[];
  updatedAt?: string;
}

const CONFIG_COLLECTION = 'config';
const STORE_SETTINGS_DOC = 'store_settings';

/**
 * Subscribes in real-time to storewide settings in Firestore.
 * Automatically propagates location URL, WhatsApp, logo, privacy policy,
 * and category changes across all devices (PC, mobile, tablet) without reload.
 */
export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    if (!db) {
      console.warn('Firestore not ready for store settings subscription');
      return () => {};
    }

    const docRef = doc(db, CONFIG_COLLECTION, STORE_SETTINGS_DOC);

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          // Document doesn't exist yet: initialize with current server or default config
          seedStoreSettingsIfEmpty();
          return;
        }

        const data = snapshot.data() as StoreSettings;
        if (!data) return;

        // 1. Sync Privacy & Location configuration
        if (data.privacyConfig && typeof data.privacyConfig === 'object') {
          try {
            const currentRaw = localStorage.getItem(PRIVACY_STORAGE_KEY);
            const current = currentRaw ? JSON.parse(currentRaw) : DEFAULT_PRIVACY_CONFIG;
            const merged = { ...current, ...data.privacyConfig };
            localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('coralink_privacy_updated', { detail: merged }));
          } catch (e) {
            console.warn('Error caching synced privacy config:', e);
          }
        }

        // 2. Sync Logo
        if (data.logoUrl !== undefined) {
          try {
            if (data.logoUrl) {
              localStorage.setItem('coralink_custom_logo', data.logoUrl);
            } else {
              localStorage.removeItem('coralink_custom_logo');
            }
            window.dispatchEvent(new CustomEvent('coralink_logo_updated', { detail: data.logoUrl }));
          } catch (e) {
            console.warn('Error caching synced logo:', e);
          }
        }

        // 3. Sync Enabled Categories
        if (data.enabledCategories) {
          try {
            localStorage.setItem(
              'coralink_enabled_categories',
              JSON.stringify(data.enabledCategories)
            );
            window.dispatchEvent(
              new CustomEvent('coralink_categories_updated', { detail: data.enabledCategories })
            );
          } catch (e) {
            console.warn('Error caching synced categories:', e);
          }
        }

        // 4. Sync Deleted Product IDs across devices
        if (Array.isArray(data.deletedProductIds) && data.deletedProductIds.length > 0) {
          const currentDeleted = getDeletedProductIds();
          let changed = false;
          data.deletedProductIds.forEach((id) => {
            if (id && !currentDeleted.has(id)) {
              markProductAsDeleted(id);
              changed = true;
            }
          });
          if (changed) {
            window.dispatchEvent(new CustomEvent('coralink_deleted_ids_updated'));
          }
        }

        onUpdate(data);
      },
      (err) => {
        console.warn('Store settings real-time listener notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to listen to store settings:', err);
    return () => {};
  }
}

/**
 * Saves store settings to Firestore cloud database so all devices synchronize.
 */
export async function saveStoreSettingsToFirestore(
  partial: Partial<StoreSettings>
): Promise<void> {
  const payload: StoreSettings = {
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  // Immediate local cache and event dispatch so current UI responds with zero latency
  try {
    if (payload.privacyConfig) {
      const currentRaw = localStorage.getItem(PRIVACY_STORAGE_KEY);
      const current = currentRaw ? JSON.parse(currentRaw) : DEFAULT_PRIVACY_CONFIG;
      const merged = { ...current, ...payload.privacyConfig };
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('coralink_privacy_updated', { detail: merged }));
    }
    if (payload.logoUrl !== undefined) {
      if (payload.logoUrl) {
        localStorage.setItem('coralink_custom_logo', payload.logoUrl);
      } else {
        localStorage.removeItem('coralink_custom_logo');
      }
      window.dispatchEvent(new CustomEvent('coralink_logo_updated', { detail: payload.logoUrl }));
    }
    if (payload.enabledCategories) {
      localStorage.setItem('coralink_enabled_categories', JSON.stringify(payload.enabledCategories));
      window.dispatchEvent(new CustomEvent('coralink_categories_updated', { detail: payload.enabledCategories }));
    }
  } catch (_) {}

  // 1. Persist to Firestore in the Cloud
  try {
    if (db) {
      const docRef = doc(db, CONFIG_COLLECTION, STORE_SETTINGS_DOC);
      await setDoc(docRef, payload, { merge: true });
      console.log('Store settings successfully synchronized to Firestore!');
    }
  } catch (err) {
    console.warn('Firestore settings sync notice:', err);
  }

  // 2. Persist to backend server as secondary storage
  try {
    if (payload.privacyConfig) {
      fetch('/api/privacy-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.privacyConfig),
      }).catch(() => {});
    }
    fetch('/api/store-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (_) {}
}

/**
 * Direct fetch of current store settings from Firestore.
 */
export async function fetchStoreSettingsFromFirestore(): Promise<StoreSettings | null> {
  try {
    if (!db) return null;
    const docRef = doc(db, CONFIG_COLLECTION, STORE_SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StoreSettings;
    }
  } catch (err) {
    console.warn('Error fetching store settings from Firestore:', err);
  }
  return null;
}

/**
 * Initializes Firestore settings if none exist yet.
 */
async function seedStoreSettingsIfEmpty(): Promise<void> {
  try {
    if (!db) return;

    // Check if server has privacy config
    let initialPrivacy = DEFAULT_PRIVACY_CONFIG;
    try {
      const res = await fetch('/api/privacy-config');
      const json = await res.json();
      if (json && json.success && json.config) {
        initialPrivacy = { ...DEFAULT_PRIVACY_CONFIG, ...json.config };
      }
    } catch (_) {}

    const initialSettings: StoreSettings = {
      privacyConfig: initialPrivacy,
      logoUrl: '',
      enabledCategories: {
        'Papelería creativa': false,
        'Detalles en resina': false,
      },
      deletedProductIds: Array.from(getDeletedProductIds()),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, CONFIG_COLLECTION, STORE_SETTINGS_DOC);
    await setDoc(docRef, initialSettings, { merge: true });
    console.log('Seeded initial store settings to Firestore');
  } catch (err) {
    console.warn('Error seeding store settings:', err);
  }
}
