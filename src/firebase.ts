import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use custom database ID if specified in config, otherwise default
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate connection per skill guidelines
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase client is currently offline:', error);
      return false;
    }
    // Any other response means we connected to Firestore servers successfully
    return true;
  }
}

validateFirestoreConnection();
export default app;
