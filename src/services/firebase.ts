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

async function createAuthInstance(app: any) {
  const authModule: any = await import('firebase/auth');

  // React Native is not a browser: getAuth() there falls back to memory
  // persistence, which loses the anonymous UID on every app restart.
  const isReactNative =
    typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

  if (isReactNative && typeof authModule.getReactNativePersistence === 'function') {
    try {
      const asyncStorageModule = await import('@react-native-async-storage/async-storage');
      const AsyncStorage = asyncStorageModule.default;
      return authModule.initializeAuth(app, {
        persistence: authModule.getReactNativePersistence(AsyncStorage),
      });
    } catch (error) {
      // Most likely "auth/already-initialized" after a Fast Refresh, or the
      // storage module is unavailable. Fall back to the existing instance.
      console.warn('React Native auth persistence setup failed:', error);
    }
  }

  return authModule.getAuth(app);
}

async function getFirebaseInstances() {
  if (dbInstance && authInstance) return { db: dbInstance, auth: authInstance };
  if (!DEFAULT_FIREBASE_CONFIG.projectId) {
    return null;
  }

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');

    const app = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApps()[0];
    dbInstance = getFirestore(app);
    authInstance = await createAuthInstance(app);

    // With AsyncStorage persistence the user is restored asynchronously.
    // Wait for that restore before deciding to create a new anonymous user.
    if (typeof authInstance.authStateReady === 'function') {
      try {
        await authInstance.authStateReady();
      } catch (readyErr) {
        console.warn('Auth state restore check failed:', readyErr);
      }
    }

    if (!authInstance.currentUser) {
      try {
        const { signInAnonymously } = await import('firebase/auth');
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
 * Builds the exact Firestore document written for a completed match.
 *
 * Kept as a pure function so the payload can be unit-tested against the
 * constraints enforced in `firestore.rules`.
 *
 * Shape:
 *   id: string (document id)
 *   timestamp: number
 *   totalRounds: integer
 *   playerCount: integer (2-6)
 *   winnerName: non-empty string
 *   players: array of player score objects
 *   userId: string (authenticated uid)
 *   syncedAt: number
 */
export function buildMatchDocument(
  match: MatchRecord,
  uid: string,
  now: number = Date.now()
): MatchRecord & { userId: string; syncedAt: number } {
  return {
    ...match,
    userId: uid,
    syncedAt: now,
  };
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
  if (!uid) {
    console.warn('Firebase sync skipped: anonymous user is not available.');
    return false;
  }

  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const matchData = buildMatchDocument(match, uid);

    await setDoc(doc(db, 'users', uid, 'matches', match.id), matchData);
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
      if (!uid) return matches;

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
        console.warn('Failed to fetch user match history:', userErr);
      }

      return matches;
    })();

    const timeoutPromise = new Promise<MatchRecord[]>(resolve => {
      // Allow enough time for a cold Firestore connection. A too-short timeout
      // makes the UI report "local" even when cloud records are reachable.
      setTimeout(() => resolve([]), 8000);
    });

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.warn('Failed to fetch from Firebase Firestore:', error);
    return [];
  }
}
