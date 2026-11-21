import { MatchRecord } from '../types/history';

/**
 * Optional Firebase Firestore Integration for Score History Bonus.
 *
 * Configured with graceful degradation:
 * If configuration is absent or offline, operations resolve safely without crashing the application.
 */

let isConfigured = false;
let dbInstance: any = null;
let authInstance: any = null;

// Firebase configuration placeholder (populated via env or user settings)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

async function getFirebaseInstances() {
  if (dbInstance && authInstance) return { db: dbInstance, auth: authInstance };
  if (!DEFAULT_FIREBASE_CONFIG.projectId) {
    return null;
  }

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getAuth, signInAnonymously } = await import('firebase/auth');

    const app = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApps()[0];
    dbInstance = getFirestore(app);
    authInstance = getAuth(app);

    // Ensure anonymous authentication for secure per-user rules
    if (!authInstance.currentUser) {
      try {
        await signInAnonymously(authInstance);
      } catch (authErr) {
        console.warn('Anonymous sign-in skipped or failed:', authErr);
      }
    }

    isConfigured = true;
    return { db: dbInstance, auth: authInstance };
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
 * Scoped securely under the authenticated user's history.
 */
export async function syncMatchToFirebase(match: MatchRecord): Promise<boolean> {
  const instances = await getFirebaseInstances();
  if (!instances) {
    return false;
  }

  const { db, auth } = instances;
  const uid = auth.currentUser?.uid;

  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const matchData = {
      ...match,
      userId: uid || 'anonymous',
      syncedAt: Date.now(),
    };

    if (uid) {
      // Primary: user-scoped secure document
      await setDoc(doc(db, 'users', uid, 'matches', match.id), matchData);
    } else {
      // Fallback
      await setDoc(doc(db, 'matches', match.id), matchData);
    }
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
  const instances = await getFirebaseInstances();
  if (!instances) {
    return [];
  }

  const { db, auth } = instances;
  const uid = auth.currentUser?.uid;

  try {
    const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const matches: MatchRecord[] = [];

    const fetchPromise = (async () => {
      if (uid) {
        // Fetch user's own matches
        try {
          const userMatchesQuery = query(
            collection(db, 'users', uid, 'matches'),
            orderBy('timestamp', 'desc'),
            limit(25)
          );
          const snapshot = await getDocs(userMatchesQuery);
          snapshot.forEach(docSnap => {
            matches.push(docSnap.data() as MatchRecord);
          });
        } catch (userErr) {
          // Fall back to root matches query if rules allow
        }
      }

      if (matches.length === 0) {
        try {
          const rootQuery = query(collection(db, 'matches'), orderBy('timestamp', 'desc'), limit(25));
          const rootSnapshot = await getDocs(rootQuery);
          rootSnapshot.forEach(docSnap => {
            matches.push(docSnap.data() as MatchRecord);
          });
        } catch (rootErr) {
          // Ignored if permissions are restricted
        }
      }

      return matches;
    })();

    const timeoutPromise = new Promise<MatchRecord[]>(resolve => {
      setTimeout(() => resolve([]), 2500);
    });

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.warn('Failed to fetch from Firebase Firestore:', error);
    return [];
  }
}
