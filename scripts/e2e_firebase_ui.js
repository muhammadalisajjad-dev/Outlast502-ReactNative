/**
 * End-to-end Firebase integration test through the real application UI.
 *
 * It does NOT write to Firestore directly. It:
 *   1. Launches the real exported web app with the real Firebase config.
 *   2. Opens Archive so the app performs its own anonymous sign-in.
 *   3. Plays a genuine 2-seat match through the real UI and engine.
 *   4. Waits for the app's own save path to create the Firestore document.
 *   5. Verifies that document using the app's own authenticated identity.
 *   6. Verifies the Archive screen, reload persistence, cloud-only retrieval,
 *      honest local fallback, and absence of duplicate records.
 *
 * Run: node scripts/e2e_firebase_ui.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '../dist');
const SHOTS = path.resolve(__dirname, '../screenshots');
const PORT = 8090;

// ── env ────────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}
const PROJECT = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
if (!PROJECT) {
  console.error('Missing EXPO_PUBLIC_FIREBASE_PROJECT_ID in .env');
  process.exit(1);
}

const FS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// ── static server ──────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const types = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.ico': 'image/x-icon',
      '.png': 'image/png',
      '.json': 'application/json',
      '.ttf': 'font/ttf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(DIST_DIR, 'index.html')).pipe(res);
  }
});

// ── REST helper ────────────────────────────────────────────────────────────
function httpsJson(method, url, token) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = https.request(
      { hostname: opts.hostname, path: opts.pathname + opts.search, method, headers },
      res => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function parseDoc(doc) {
  const f = doc.fields || {};
  const num = v => (v == null ? undefined : Number(v.integerValue ?? v.doubleValue));
  return {
    name: doc.name,
    id: f.id && f.id.stringValue,
    timestamp: num(f.timestamp),
    totalRounds: num(f.totalRounds),
    playerCount: num(f.playerCount),
    winnerName: f.winnerName && f.winnerName.stringValue,
    userId: f.userId && f.userId.stringValue,
    syncedAt: num(f.syncedAt),
    players: ((f.players && f.players.arrayValue && f.players.arrayValue.values) || []).map(v => {
      const pf = (v.mapValue && v.mapValue.fields) || {};
      return {
        playerId: pf.playerId && pf.playerId.stringValue,
        name: pf.name && pf.name.stringValue,
        isHuman: pf.isHuman && pf.isHuman.booleanValue,
        finalScore: num(pf.finalScore),
        isEliminated: pf.isEliminated && pf.isEliminated.booleanValue,
        isWinner: pf.isWinner && pf.isWinner.booleanValue,
      };
    }),
  };
}

// ── page helpers ───────────────────────────────────────────────────────────
async function clickIfVisible(page, locator, label, timeout = 1200) {
  try {
    const first = locator.first();
    if ((await locator.count()) === 0) return false;
    if (!(await first.isVisible())) {
      if (process.env.E2E_DEBUG === '1') console.log(`    [debug] ${label}: not visible`);
      return false;
    }
    await first.click({ timeout });
    if (label) console.log(`    action: ${label}`);
    return true;
  } catch (e) {
    if (process.env.E2E_DEBUG === '1') {
      console.log(`    [debug] ${label}: click failed — ${String(e.message).split('\n')[0]}`);
    }
    return false;
  }
}

async function readAuth(page) {
  return page.evaluate(async () => {
    const openDb = name =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open(name);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

    let names = [];
    try {
      names = (await indexedDB.databases()).map(d => d.name).filter(Boolean);
    } catch {
      names = [];
    }
    const dbName = names.find(n => n.indexOf('firebaseLocalStorage') !== -1);
    if (!dbName) return null;

    const db = await openDb(dbName);
    if (!db.objectStoreNames.contains('firebaseLocalStorage')) return null;
    const tx = db.transaction('firebaseLocalStorage', 'readonly');
    const store = tx.objectStore('firebaseLocalStorage');
    const all = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    for (const entry of all) {
      const v = entry && entry.value;
      if (v && v.uid && v.stsTokenManager && v.stsTokenManager.accessToken) {
        return { uid: v.uid, token: v.stsTokenManager.accessToken };
      }
    }
    return null;
  });
}

async function waitForAuth(page, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const auth = await readAuth(page);
    if (auth) return auth;
    await page.waitForTimeout(500);
  }
  return null;
}

async function listMatches(uid, token) {
  const res = await httpsJson(
    'GET',
    `${FS_BASE}/users/${uid}/matches?pageSize=50`,
    token
  );
  if (res.status !== 200) return { status: res.status, docs: [] };
  return {
    status: 200,
    docs: (res.body.documents || []).map(parseDoc),
  };
}

async function waitForMatchDoc(auth, timeoutMs = 30000) {
  const start = Date.now();
  let last = { status: 0, docs: [] };
  while (Date.now() - start < timeoutMs) {
    last = await listMatches(auth.uid, auth.token);
    if (last.status === 200 && last.docs.length > 0) return last;
    await new Promise(r => setTimeout(r, 1000));
  }
  return last;
}

async function clickPlayableCard(page) {
  const playable = page.locator('[data-testid="playable-card"]');
  const count = await playable.count();
  if (count === 0) return false;

  // Cards overlap in a fan, so the first playable card is usually covered by
  // its neighbour. The last playable card is highest in the z-order and its
  // left strip is always exposed, so click there.
  const target = playable.nth(count - 1);
  try {
    await target.scrollIntoViewIfNeeded({ timeout: 1500 });
  } catch {
    /* ignore */
  }
  try {
    await target.click({ position: { x: 18, y: 34 }, force: true, timeout: 2500 });
    return true;
  } catch (e) {
    if (process.env.E2E_DEBUG === '1') {
      console.log(`    [debug] play card: click failed — ${String(e.message).split('\n')[0]}`);
    }
    return false;
  }
}

async function openArchive(page) {
  await page.getByText('Archive', { exact: true }).first().click();
  await page.waitForTimeout(500);
}

async function waitForBody(page, predicate, timeoutMs = 15000) {
  const start = Date.now();
  let text = '';
  while (Date.now() - start < timeoutMs) {
    text = await page.locator('body').innerText();
    if (predicate(text)) return text;
    await page.waitForTimeout(500);
  }
  return text;
}

async function dumpTable(page, actions) {
  try {
    const handBlock = page.getByText('Your hand', { exact: false }).first();
    const blockText = await handBlock.locator('xpath=..').innerText().catch(() => '?');
    const body = await page.locator('body').innerText();
    const penalty = /CARDS OWED|ACE OF SPADES|SKIP ACTIVE|2-STACK/i.test(body);
    const playableDom = await page.locator('[data-testid="playable-card"]').count();
    const cardDom = await page.locator('[data-testid="card-item"]').count();
    const hint = await page
      .getByText(/plays? ready|No match/i)
      .first()
      .innerText()
      .catch(() => '?');
    const logLine =
      body.split('\n').find(l => /played|drew|skipped|demanded|Round/i.test(l)) || '';
    console.log(
      `    [debug ${actions}] hand="${blockText.replace(/\n/g, ' ')}" playableDom=${playableDom} cardDom=${cardDom} hint="${hint}" penalty=${penalty} log="${logLine.slice(0, 90)}"`
    );
  } catch (e) {
    console.log(`    [debug ${actions}] dump failed: ${e.message}`);
  }
}

// ── main ───────────────────────────────────────────────────────────────────
async function run() {
  server.listen(PORT);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error') pageErrors.push(`console: ${m.text()}`);
  });

  const report = {};
  let exitCode = 0;

  try {
    // 1. Launch and establish the app's own anonymous identity via Archive.
    console.log('Step 1: Launching app and initialising Firebase auth via Archive...');
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await openArchive(page);

    const auth = await waitForAuth(page);
    if (!auth) throw new Error('Anonymous auth did not initialise in the app');
    console.log(`  ✓ App authenticated anonymously. UID: ${auth.uid}`);
    report.uid = auth.uid;

    const before = await listMatches(auth.uid, auth.token);
    if (before.status !== 200) {
      throw new Error(`Cannot list user's matches (HTTP ${before.status})`);
    }
    console.log(`  ✓ Existing cloud records for this user: ${before.docs.length}`);

    if (process.env.E2E_SMOKE === '1') {
      console.log('\nE2E_SMOKE=1 — stopping after auth and collection access.');
      return;
    }

    // 2. Play a genuine 2-seat match through the real UI.
    console.log('\nStep 2: Playing a real 2-seat match through the UI...');
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await page.getByText('The table', { exact: true }).first().click();
    await page.getByText(/New match/i).first().waitFor({ timeout: 10000 });
    await page.waitForTimeout(500);
    await page.getByText(/^duel$/i).first().click();
    await page.waitForTimeout(400);
    await page.getByText(/Deal cards/i).first().click();
    await page.waitForTimeout(1500);

    const deadline = Date.now() + 13 * 60 * 1000;
    const maxActions = Number(process.env.E2E_MAX_ACTIONS || 0);
    let actions = 0;
    let rounds = 0;
    let matchComplete = false;

    while (Date.now() < deadline) {
      if (maxActions && actions >= maxActions) {
        console.log(`\nE2E_MAX_ACTIONS=${maxActions} — stopping the match early for a smoke check.`);
        return;
      }
      if ((await page.getByText('MATCH COMPLETE').count()) > 0) {
        matchComplete = true;
        break;
      }

      if (await clickIfVisible(page, page.getByText('Start Next Round', { exact: true }), null)) {
        rounds += 1;
        console.log(`  round ${rounds} complete → next round`);
        await page.waitForTimeout(700);
        continue;
      }

      if (await clickIfVisible(page, page.locator('[data-testid="suit-select-spades"]'), null)) {
        console.log('    action: declared spades for a Jack');
        await page.waitForTimeout(400);
        continue;
      }

      if (
        await clickIfVisible(
          page,
          page.getByText(/^(Draw \d+( Cards)?|Accept Skip)$/),
          'accept penalty'
        )
      ) {
        await page.waitForTimeout(1200);
        actions += 1;
        continue;
      }

      if (await clickPlayableCard(page)) {
        console.log('    action: play card');
        await page.waitForTimeout(1200);
        actions += 1;
        if (process.env.E2E_DEBUG === '1' && actions % 5 === 0) {
          await dumpTable(page, actions);
        }
        continue;
      }

      if ((await page.getByText('Tap to draw', { exact: true }).count()) > 0) {
        if (await clickIfVisible(page, page.locator('[data-testid="draw-pile-btn"]'), 'draw card')) {
          await page.waitForTimeout(1200);
          actions += 1;
          if (process.env.E2E_DEBUG === '1' && actions % 5 === 0) {
            await dumpTable(page, actions);
          }
          continue;
        }
      }

      await page.waitForTimeout(300);
    }

    if (!matchComplete) {
      throw new Error(`Match did not complete. Actions: ${actions}, rounds: ${rounds}`);
    }
    console.log(`  ✓ Match completed. Rounds: ${rounds}, human actions: ${actions}`);
    report.rounds = rounds;
    report.actions = actions;

    await page.screenshot({ path: path.join(SHOTS, 'e2e_match_complete.png') });

    const winnerText = await page
      .locator('text=OUTLAST 502 CHAMPION')
      .first()
      .isVisible()
      .catch(() => false);
    console.log(`  ✓ Game-over screen shown: ${winnerText}`);

    // 3. Wait for the app's own save path to reach Firestore.
    console.log('\nStep 3: Waiting for the app to save the match to Firestore...');
    const after = await waitForMatchDoc(auth, 40000);
    if (after.status !== 200) {
      throw new Error(`Cloud read failed after match (HTTP ${after.status})`);
    }
    if (after.docs.length === 0) {
      throw new Error('No Firestore document appeared after match completion');
    }
    console.log(`  ✓ Cloud records now: ${after.docs.length}`);

    const doc = after.docs[0];
    const docId = doc.name.split('/').pop();
    console.log(`  ✓ Document: users/${doc.userId}/matches/${docId}`);
    console.log(
      `    winner="${doc.winnerName}" rounds=${doc.totalRounds} players=${doc.playerCount}`
    );
    console.log(
      `    scores: ${doc.players.map(p => `${p.name}=${p.finalScore}`).join(', ')}`
    );

    const checks = [];
    const check = (ok, label, detail) => {
      checks.push({ ok, label, detail });
      console.log(`  ${ok ? '\u2713' : '\u2717'} ${label}${detail ? ` — ${detail}` : ''}`);
    };

    console.log('\nStep 4: Verifying the Firestore document written by the app...');
    check(doc.userId === auth.uid, 'Document is scoped to the app UID');
    check(docId === doc.id, 'Document id field matches its document path');
    check(typeof doc.timestamp === 'number', 'timestamp is a number');
    check(Number.isInteger(doc.totalRounds) && doc.totalRounds >= 1, 'totalRounds is a positive integer');
    check(doc.playerCount === 2, 'playerCount is 2', String(doc.playerCount));
    check(doc.players.length === 2, 'players list has 2 entries');
    check(typeof doc.winnerName === 'string' && doc.winnerName.length > 0, 'winnerName is present', doc.winnerName);
    check(typeof doc.syncedAt === 'number', 'syncedAt is a number');
    check(
      doc.players.filter(p => p.isWinner).length === 1 &&
        doc.players.find(p => p.isWinner).name === doc.winnerName,
      'Exactly one winner and it matches winnerName'
    );
    check(
      doc.players.some(p => p.isHuman) && doc.players.some(p => !p.isHuman),
      'Players include the human seat and the bot seat'
    );
    report.doc = doc;

    // 5. Archive screen shows the record.
    console.log('\nStep 5: Opening the in-app Archive...');
    await page.getByText('Main Menu', { exact: true }).first().click();
    await page.waitForTimeout(700);
    await openArchive(page);
    const bodyText = await waitForBody(
      page,
      t => /cloud ledger active/i.test(t) && /1 entry in the book/i.test(t),
      15000
    );
    const up = bodyText.toUpperCase();
    check(/1 entry in the book/i.test(bodyText), 'Archive shows exactly 1 entry');
    check(up.includes(doc.winnerName.toUpperCase()), 'Archive shows the champion name', doc.winnerName);
    check(up.includes(`${doc.totalRounds} ROUNDS`), 'Archive shows the round count', `${doc.totalRounds} rounds`);
    doc.players.forEach(p => {
      check(
        up.includes(p.name.toUpperCase()) && bodyText.includes(String(p.finalScore)),
        `Archive shows ${p.name} with ${p.finalScore} pts`
      );
    });
    check(/cloud ledger active/i.test(bodyText), 'Archive reports the cloud ledger as active');
    await page.screenshot({ path: path.join(SHOTS, 'e2e_archive_cloud.png') });

    // 6. Reload persistence.
    console.log('\nStep 6: Reloading the app and re-checking Archive...');
    await page.reload({ waitUntil: 'networkidle' });
    await openArchive(page);
    const afterReload = await waitForBody(
      page,
      t => /cloud ledger active/i.test(t) && /1 entry in the book/i.test(t),
      15000
    );
    const upReload = afterReload.toUpperCase();
    check(/1 entry in the book/i.test(afterReload), 'Archive still shows 1 entry after reload');
    check(upReload.includes(doc.winnerName.toUpperCase()), 'Champion still present after reload');
    check(/cloud ledger active/i.test(afterReload), 'Cloud ledger still active after reload');

    // 7. Cloud-only retrieval: clear local history, keep auth, reload.
    console.log('\nStep 7: Clearing local history and reloading to prove cloud retrieval...');
    const cleared = await page.evaluate(() => {
      const removed = [];
      for (const key of Object.keys(localStorage)) {
        if (/outlast502/i.test(key)) {
          localStorage.removeItem(key);
          removed.push(key);
        }
      }
      return removed;
    });
    console.log(`  removed local keys: ${JSON.stringify(cleared)}`);
    await page.reload({ waitUntil: 'networkidle' });
    await openArchive(page);
    const cloudOnly = await waitForBody(
      page,
      t => /cloud ledger active/i.test(t) && /1 entry in the book/i.test(t),
      18000
    );
    const upCloudOnly = cloudOnly.toUpperCase();
    check(/1 entry in the book/i.test(cloudOnly), 'Archive rebuilds the entry from Firestore alone');
    check(upCloudOnly.includes(doc.winnerName.toUpperCase()), 'Cloud-only entry shows the champion');
    check(/cloud ledger active/i.test(cloudOnly), 'Cloud ledger active on cloud-only load');
    check(!/local ledger active/i.test(cloudOnly), 'Does not fall back to local while cloud works');
    await page.screenshot({ path: path.join(SHOTS, 'e2e_archive_cloud_only.png') });

    // 8. Honest fallback when cloud is unreachable.
    console.log('\nStep 8: Blocking Firestore to verify honest local fallback...');
    await page.route('**/firestore.googleapis.com/**', route => route.abort());
    await page.reload({ waitUntil: 'networkidle' });
    await openArchive(page);
    const offline = await waitForBody(page, t => /local ledger active/i.test(t), 15000);
    check(/local ledger active/i.test(offline), 'Shows local ledger when cloud is unreachable');
    check(!/cloud ledger active/i.test(offline), 'Does not claim cloud when cloud is unreachable');
    await page.screenshot({ path: path.join(SHOTS, 'e2e_archive_offline.png') });
    await page.unroute('**/firestore.googleapis.com/**');

    // 9. Duplicate check.
    console.log('\nStep 9: Checking for duplicate records...');
    const finalList = await listMatches(auth.uid, auth.token);
    check(finalList.status === 200, 'Cloud collection readable at the end');
    check(finalList.docs.length === 1, 'Exactly one cloud record after match, reloads and clears',
      `${finalList.docs.length} found`);
    check(new Set(finalList.docs.map(d => d.id)).size === finalList.docs.length,
      'No duplicate document ids');

    const failed = checks.filter(c => !c.ok);
    report.checks = checks;
    if (failed.length > 0) {
      console.log(`\n=== E2E FAILED: ${failed.length} check(s) ===`);
      failed.forEach(f => console.log(`  ✗ ${f.label}`));
      exitCode = 1;
    } else {
      console.log('\n=== E2E PASSED: app → Firebase → Archive → reload all verified ===');
    }
  } catch (err) {
    console.error('\nE2E ERROR:', err && err.message ? err.message : err);
    exitCode = 1;
  } finally {
    const realErrors = pageErrors.filter(
      e =>
        !/firestore\.googleapis\.com|Failed to load resource|ERR_FAILED|net::|Could not reach Cloud Firestore backend|client will operate in offline mode/i.test(
          e
        )
    );
    if (realErrors.length) {
      console.log('\nBROWSER ERRORS:');
      realErrors.forEach(e => console.log(`- ${e}`));
      exitCode = 1;
    } else {
      console.log('\nNo unexpected browser errors.');
    }

    fs.writeFileSync(
      path.join(SHOTS, 'e2e_firebase_report.json'),
      JSON.stringify(report, null, 2)
    );

    await context.close();
    await browser.close();
    server.close();
    process.exit(exitCode);
  }
}

run().catch(err => {
  console.error(err);
  server.close();
  process.exit(1);
});
