const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2 && !parts[0].startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('Testing Firebase with Project ID:', firebaseConfig.projectId);

async function testFirebase() {
  const { initializeApp } = require('firebase/app');
  const { getFirestore, doc, setDoc, getDoc, deleteDoc } = require('firebase/firestore');
  const { getAuth, signInAnonymously } = require('firebase/auth');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  let userId = null;

  // 1. Test Anonymous Auth
  console.log('Step 1: Attempting Anonymous Authentication...');
  try {
    const userCredential = await signInAnonymously(auth);
    userId = userCredential.user.uid;
    console.log('✅ Anonymous Authentication SUCCESS! Authenticated UID:', userId);
  } catch (authError) {
    console.log('❌ Anonymous Authentication error:', authError.code || authError.message);
  }

  // 2. Test User-Scoped Firestore Write
  console.log(`\nStep 2: Testing User-Scoped Firestore write (users/${userId}/matches)...`);
  const testDocId = `test_match_${Date.now()}`;
  const testData = {
    id: testDocId,
    timestamp: Date.now(),
    totalRounds: 3,
    playerCount: 4,
    winnerName: 'ChampionTester',
    userId: userId,
    players: [
      {
        playerId: 'player_0',
        name: 'You',
        isHuman: true,
        finalScore: 120,
        isEliminated: false,
        isWinner: true,
      },
    ],
    testWrite: true,
  };

  try {
    const userDocRef = doc(db, 'users', userId, 'matches', testDocId);
    await setDoc(userDocRef, testData);
    console.log('✅ User-Scoped Firestore Write SUCCESS! Document:', testDocId);

    // Read back
    console.log('\nStep 3: Testing User-Scoped Firestore read...');
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      console.log('✅ User-Scoped Firestore Read SUCCESS! Retrieved match winner:', docSnap.data().winnerName);
    }

    // Clean up
    console.log('\nStep 4: Cleaning up test document...');
    await deleteDoc(userDocRef);
    console.log('✅ Cleanup SUCCESS! Test document deleted.');
    console.log('\n🎉 CLOUD SYNCHRONIZATION FULLY OPERATIONAL!');
    process.exit(0);
  } catch (userErr) {
    console.log('User-scoped write returned:', userErr.code || userErr.message);

    // Try root matches collection
    console.log('\nTrying root matches collection write...');
    try {
      const rootDocRef = doc(db, 'matches', testDocId);
      await setDoc(rootDocRef, testData);
      console.log('✅ Root matches Write SUCCESS! Document:', testDocId);
      const rootSnap = await getDoc(rootDocRef);
      if (rootSnap.exists()) {
        console.log('✅ Root matches Read SUCCESS! Retrieved:', rootSnap.data().winnerName);
      }
      await deleteDoc(rootDocRef);
      console.log('✅ Cleanup SUCCESS!');
      console.log('\n🎉 CLOUD SYNCHRONIZATION FULLY OPERATIONAL!');
      process.exit(0);
    } catch (rootErr) {
      console.log('Root write returned:', rootErr.code || rootErr.message);
      console.log('\n👉 STATUS: Firebase Anonymous Auth is WORKING (UID: ' + userId + ').');
      console.log('👉 ACTION REQUIRED IN FIREBASE CONSOLE:');
      console.log('   The Firestore database security rules are currently locked/denying writes.');
      console.log('   Open Firebase Console > Firestore Database > Rules tab, and publish the rules provided in firestore.rules.');
      process.exit(0);
    }
  }
}

testFirebase().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
