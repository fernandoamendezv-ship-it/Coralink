import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  projectId: rawConfig.projectId || 'nifty-pulsar-g03js',
  appId: rawConfig.appId || '1:131673584933:web:7ff5367f6ddfe5f2ffd6cc',
  apiKey: rawConfig.apiKey || 'AIzaSyBnQW3KPDpwlfnPiNfP05wT63EsY707H0U',
  authDomain: rawConfig.authDomain || 'nifty-pulsar-g03js.firebaseapp.com',
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || 'ai-studio-coralinkartepers-7de2d54e-2d5d-4e20-a5f3-9aa9659e6dae',
  storageBucket: rawConfig.storageBucket || 'nifty-pulsar-g03js.firebasestorage.app',
  messagingSenderId: rawConfig.messagingSenderId || '131673584933',
};

let app: FirebaseApp;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (e) {
  console.warn('Firebase initializeApp notice:', e);
  app = getApps()[0];
}

let firestoreInstance: Firestore;
try {
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
} catch (err) {
  console.warn('Error creating Firestore with custom databaseId, falling back to default:', err);
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// Validate connection safely without blocking app initialization
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    if (!db) return false;
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase client is currently offline:', error);
      return false;
    }
    // Any other response means we contacted Firestore servers successfully
    return true;
  }
}

// Execute connection check safely in the background
if (typeof window !== 'undefined') {
  setTimeout(() => {
    validateFirestoreConnection().catch((err) => {
      console.warn('Background Firestore connection check notice:', err);
    });
  }, 100);
}

export default app;
