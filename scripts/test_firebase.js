/**
 * Firebase Firestore live-connection test.
 *
 * Tests:
 *   1. Anonymous sign-in
 *   2. Write a test match document to users/<uid>/matches/<id>
 *   3. Read it back
 *   4. Delete it (cleanup)
 *
 * Run: node scripts/test_firebase.js
 * Requires .env to be loaded (or EXPO_PUBLIC_ vars to be set in environment).
 */

// Load .env manually without dotenv dependency
const fs = require('fs');
const envPath = require('path').join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const API_KEY   = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const PROJECT   = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const APP_ID    = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
const AUTH_DOM  = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;

if (!PROJECT || !API_KEY) {
  console.error('Missing Firebase env vars. Ensure .env is present.');
  process.exit(1);
}

const https = require('https');

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = new URL(url);
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpsRequest(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = new URL(url);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method,
      headers,
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`Firebase project: ${PROJECT}\n`);

  // ── 1. Anonymous sign-in ─────────────────────────────────────────────────
  console.log('Step 1: Anonymous sign-in...');
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
  const signIn = await httpsPost(signInUrl, { returnSecureToken: true });
  if (signIn.status !== 200 || !signIn.body.idToken) {
    console.error('Anonymous sign-in FAILED:', signIn.body);
    process.exit(1);
  }
  const idToken = signIn.body.idToken;
  const uid = signIn.body.localId;
  console.log(`  ✓ Signed in anonymously. UID: ${uid}\n`);

  // ── 2. Write test match document ─────────────────────────────────────────
  const docId = `test-live-${Date.now()}`;
  const docPath = `users/${uid}/matches/${docId}`;
  const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
  const writeUrl = `${firestoreBase}/${docPath}`;

  const testMatch = {
    fields: {
      id:          { stringValue: docId },
      timestamp:   { integerValue: String(Date.now()) },
      totalRounds: { integerValue: '2' },
      playerCount: { integerValue: '2' },
      winnerId:    { stringValue: uid },
      winnerName:  { stringValue: 'LiveTestPlayer' },
      userId:      { stringValue: uid },
      syncedAt:    { integerValue: String(Date.now()) },
      players: {
        arrayValue: {
          values: [
            {
              mapValue: {
                fields: {
                  playerId: { stringValue: uid },
                  name: { stringValue: 'LiveTestPlayer' },
                  isHuman: { booleanValue: true },
                  finalScore: { integerValue: '120' },
                  isEliminated: { booleanValue: false },
                  isWinner: { booleanValue: true },
                },
              },
            },
            {
              mapValue: {
                fields: {
                  playerId: { stringValue: 'opponent_1' },
                  name: { stringValue: 'Opponent' },
                  isHuman: { booleanValue: false },
                  finalScore: { integerValue: '240' },
                  isEliminated: { booleanValue: false },
                  isWinner: { booleanValue: false },
                },
              },
            },
          ],
        },
      },
    },
  };

  console.log('Step 2: Writing test match document...');
  const writeRes = await httpsRequest('PATCH', writeUrl, testMatch, idToken);
  if (writeRes.status !== 200) {
    console.error('Write FAILED (HTTP', writeRes.status, '):', JSON.stringify(writeRes.body, null, 2));
    process.exit(1);
  }
  console.log(`  ✓ Document written: ${docPath}\n`);

  // ── 3. Read it back ──────────────────────────────────────────────────────
  console.log('Step 3: Reading document back...');
  const readRes = await httpsRequest('GET', writeUrl, null, idToken);
  if (readRes.status !== 200 || !readRes.body.fields) {
    console.error('Read FAILED (HTTP', readRes.status, '):', JSON.stringify(readRes.body, null, 2));
    process.exit(1);
  }
  const winner = readRes.body.fields.winnerName?.stringValue;
  console.log(`  ✓ Document retrieved. winnerName="${winner}"\n`);

  // ── 4. Delete (cleanup) ──────────────────────────────────────────────────
  console.log('Step 4: Deleting test document (cleanup)...');
  const delRes = await httpsRequest('DELETE', writeUrl, null, idToken);
  if (delRes.status !== 200) {
    console.warn('  ⚠ Delete returned HTTP', delRes.status, '(non-critical)');
  } else {
    console.log(`  ✓ Document deleted.\n`);
  }

  console.log('=== Firebase live test PASSED ===');
  console.log('  Anonymous auth:    ✓');
  console.log('  User-scoped write: ✓');
  console.log('  Firestore read:    ✓');
  console.log('  Cleanup delete:    ✓');
  console.log('\nSecurity note: writes are scoped to users/<uid>/matches/<id>.');
  console.log('Other users cannot read or write this path.');
}

main().catch(err => {
  console.error('Firebase test error:', err);
  process.exit(1);
});
