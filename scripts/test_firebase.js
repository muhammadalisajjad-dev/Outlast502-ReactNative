/**
 * Firebase Firestore live-connection and isolation test.
 *
 * Verifies, against the real project and the published security rules:
 *   1. Anonymous sign-in (same method as the app)
 *   2. Write the exact document shape the app writes
 *   3. Read it back as the owner
 *   4. A second anonymous user CANNOT read the first user's document
 *   5. A second anonymous user CANNOT delete the first user's document
 *   6. The owner can delete their own document
 *   7. The document is really gone after delete
 *
 * Run: node scripts/test_firebase.js
 * Requires .env (or EXPO_PUBLIC_ vars in the environment).
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

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const PROJECT = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

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

async function signInAnonymously() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
  const res = await httpsPost(url, { returnSecureToken: true });
  if (res.status !== 200 || !res.body.idToken) {
    return { ok: false, status: res.status, body: res.body };
  }
  return { ok: true, idToken: res.body.idToken, uid: res.body.localId };
}

const failures = [];
function check(condition, label, detail) {
  if (condition) {
    console.log(`  \u2713 ${label}`);
  } else {
    failures.push(label);
    console.log(`  \u2717 ${label}${detail ? ` \u2014 ${detail}` : ''}`);
  }
}

function isDenied(res) {
  return res.status === 403 || res.status === 401;
}

async function main() {
  console.log(`Firebase project: ${PROJECT}`);
  console.log('Database: (default)');
  console.log('Collection path: users/{uid}/matches/{matchId}\n');

  // ── 1. Owner sign-in ─────────────────────────────────────────────────────
  console.log('Step 1: Anonymous sign-in (owner)...');
  const owner = await signInAnonymously();
  if (!owner.ok) {
    console.error('Anonymous sign-in FAILED (HTTP', owner.status, '):', JSON.stringify(owner.body, null, 2));
    console.error('\nEnable Anonymous authentication: Firebase Console > Authentication > Sign-in method > Anonymous > Enable.');
    process.exit(1);
  }
  console.log(`  \u2713 Signed in anonymously. UID: ${owner.uid}\n`);

  const docId = `test-live-${Date.now()}`;
  const docPath = `users/${owner.uid}/matches/${docId}`;
  const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
  const docUrl = `${firestoreBase}/${docPath}`;

  // ── 2. Write the exact shape the application writes ──────────────────────
  // Mirrors MatchRecord from src/types/history.ts plus userId and syncedAt
  // added by syncMatchToFirebase() in src/services/firebase.ts.
  const now = Date.now();
  const appPayload = {
    fields: {
      id:          { stringValue: docId },          // string, equals document id
      timestamp:   { integerValue: String(now) },   // number (Date.now())
      totalRounds: { integerValue: '2' },           // int
      playerCount: { integerValue: '2' },           // int
      winnerName:  { stringValue: 'LiveTestPlayer' }, // string
      players: {                                    // list of player objects
        arrayValue: {
          values: [
            {
              mapValue: {
                fields: {
                  playerId:     { stringValue: owner.uid },
                  name:         { stringValue: 'LiveTestPlayer' },
                  isHuman:      { booleanValue: true },
                  finalScore:   { integerValue: '120' },
                  isEliminated: { booleanValue: false },
                  isWinner:     { booleanValue: true },
                },
              },
            },
            {
              mapValue: {
                fields: {
                  playerId:     { stringValue: 'opponent_1' },
                  name:         { stringValue: 'Opponent' },
                  isHuman:      { booleanValue: false },
                  finalScore:   { integerValue: '240' },
                  isEliminated: { booleanValue: false },
                  isWinner:     { booleanValue: false },
                },
              },
            },
          ],
        },
      },
      userId:      { stringValue: owner.uid },      // string, equals auth uid
      syncedAt:    { integerValue: String(now) },   // number
    },
  };

  console.log('Step 2: Writing app-shaped match document...');
  const writeRes = await httpsRequest('PATCH', docUrl, appPayload, owner.idToken);
  if (writeRes.status !== 200) {
    console.error('Write FAILED (HTTP', writeRes.status, '):', JSON.stringify(writeRes.body, null, 2));
    console.error('\nIf this is 403, the rules in firestore.rules have not been published yet.');
    process.exit(1);
  }
  console.log(`  \u2713 Document written: ${docPath}\n`);

  // ── 3. Owner reads it back ───────────────────────────────────────────────
  console.log('Step 3: Reading document back as owner...');
  const readRes = await httpsRequest('GET', docUrl, null, owner.idToken);
  const readFields = readRes.body && readRes.body.fields ? readRes.body.fields : {};
  check(readRes.status === 200, 'Owner read succeeded', `HTTP ${readRes.status}`);
  check(readFields.winnerName && readFields.winnerName.stringValue === 'LiveTestPlayer', 'winnerName round-tripped');
  check(readFields.userId && readFields.userId.stringValue === owner.uid, 'userId round-tripped');
  check(readFields.id && readFields.id.stringValue === docId, 'id round-tripped');
  check(readFields.playerCount && readFields.playerCount.integerValue === '2', 'playerCount round-tripped');
  check(
    readFields.players && readFields.players.arrayValue &&
      Array.isArray(readFields.players.arrayValue.values) &&
      readFields.players.arrayValue.values.length === 2,
    'players list round-tripped'
  );
  console.log('');

  // ── 4. A different user cannot read it ───────────────────────────────────
  console.log('Step 4: Second anonymous user tries to read the owner\'s document...');
  const intruder = await signInAnonymously();
  if (!intruder.ok) {
    console.error('Second anonymous sign-in FAILED (HTTP', intruder.status, '):', JSON.stringify(intruder.body, null, 2));
    process.exit(1);
  }
  check(intruder.uid !== owner.uid, 'Second user has a different UID');
  const crossRead = await httpsRequest('GET', docUrl, null, intruder.idToken);
  check(isDenied(crossRead), 'Cross-user read denied', `HTTP ${crossRead.status}`);
  console.log('');

  // ── 5. A different user cannot delete it ─────────────────────────────────
  console.log('Step 5: Second anonymous user tries to delete the owner\'s document...');
  const crossDelete = await httpsRequest('DELETE', docUrl, null, intruder.idToken);
  check(isDenied(crossDelete), 'Cross-user delete denied', `HTTP ${crossDelete.status}`);

  const stillThere = await httpsRequest('GET', docUrl, null, owner.idToken);
  check(stillThere.status === 200, 'Document still exists after blocked delete', `HTTP ${stillThere.status}`);
  console.log('');

  // ── 6. Owner deletes it ──────────────────────────────────────────────────
  console.log('Step 6: Owner deletes their own document...');
  const delRes = await httpsRequest('DELETE', docUrl, null, owner.idToken);
  check(delRes.status === 200, 'Owner delete succeeded', `HTTP ${delRes.status}`);
  console.log('');

  // ── 7. Confirm it is gone ────────────────────────────────────────────────
  console.log('Step 7: Confirming the document is gone...');
  const goneRes = await httpsRequest('GET', docUrl, null, owner.idToken);
  check(goneRes.status === 404, 'Document no longer exists', `HTTP ${goneRes.status}`);
  console.log('');

  if (failures.length > 0) {
    console.error(`=== Firebase live test FAILED (${failures.length} check(s)) ===`);
    failures.forEach(f => console.error(`  \u2717 ${f}`));
    process.exit(1);
  }

  console.log('=== Firebase live test PASSED ===');
  console.log('  Anonymous auth:          \u2713');
  console.log('  Owner write:             \u2713');
  console.log('  Owner read:              \u2713');
  console.log('  Cross-user read denied:  \u2713');
  console.log('  Cross-user delete denied:\u2713');
  console.log('  Owner delete:            \u2713');
  console.log('  Document removed:        \u2713');
  console.log('\nWrites and reads are scoped to users/<uid>/matches/<id>.');
}

main().catch(err => {
  console.error('Firebase test error:', err);
  process.exit(1);
});
