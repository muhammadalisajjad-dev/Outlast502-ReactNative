import { MatchRecord } from '../types/history';

/**
 * Optional Firebase Firestore Integration for Score History Bonus.
 *
 * Configured with graceful degradation:
 * If configuration is absent or offline, operations resolve safely without crashing the application.
 */

let isConfigured = false;
let dbInstance: any = null;

// Firebase configuration placeholder (populated via env or user settings)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

async function getFirestoreDb() {
  if (dbInstance) return dbInstance;
  if (!DEFAULT_FIREBASE_CONFIG.projectId) {
    return null;
  }

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');

    const app = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApps()[0];
    dbInstance = getFirestore(app);
    isConfigured = true;
    return dbInstance;
  } catch (error) {
    console.warn('Firebase initialization skipped or failed:', error);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return isConfigured || Boolean(DEFAULT_FIREBASE_CONFIG.projectId);
}

/**
 * Syncs a completed match record to Firebase Firestore.
 */
export async function syncMatchToFirebase(match: MatchRecord): Promise<boolean> {
  const db = await getFirestoreDb();
  if (!db) {
    return false;
  }

  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'matches', match.id), {
      ...match,
      syncedAt: Date.now(),
    });
    return true;
  } catch (error) {
    console.warn('Failed to sync match to Firebase:', error);
    return false;
  }
}

/**
 * Fetches recent match history from Firebase Firestore.
 */
export async function fetchFirebaseHistory(): Promise<MatchRecord[]> {
  const db = await getFirestoreDb();
  if (!db) {
    return [];
  }

  try {
    const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const q = query(collection(db, 'matches'), orderBy('timestamp', 'desc'), limit(25));
    const snapshot = await getDocs(q);

    const matches: MatchRecord[] = [];
    snapshot.forEach(docSnap => {
      matches.push(docSnap.data() as MatchRecord);
    });
    return matches;
  } catch (error) {
    console.warn('Failed to fetch from Firebase Firestore:', error);
    return [];
  }
}
