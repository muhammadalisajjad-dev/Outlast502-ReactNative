/**
 * OUTLAST 502 — UI Review Recording Script
 *
 * Generates:
 *   C:\Users\hp\Downloads\OUTLAST502-UI-REVIEW.webm  — continuous walkthrough video
 *   screenshots/final/                               — per-viewport PNG screenshots
 *
 * Notes:
 *  - Sound: Web Audio API synthesiser works in Chromium (browser).
 *    Playwright cannot capture browser audio into the video stream;
 *    the WebM will have no audio track.
 *    On Android/iOS the same sound utility is a no-op (Platform.OS guard).
 *    Haptics (Expo Haptics) work on physical Android/iOS only; no-op in browser.
 *
 *  - History: The script seeds ONE test-fixture match record into localStorage
 *    so the History screen can be shown. It is clearly labelled as a test fixture.
 *    Firebase Firestore sync is configured via EXPO_PUBLIC_ env vars; the app
 *    will only display "CLOUD PERSISTENCE ACTIVE" when Firestore actually returns records.
 *
 *  - Physical device: This script tests the web bundle at browser viewports.
 *    Physical Android (Realme Note 50) validation has NOT been performed by this script.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '../dist');
const OUTPUT_VIDEO_PATH = 'C:\\Users\\hp\\Downloads\\OUTLAST502-UI-REVIEW.webm';
const FINAL_SCREENSHOTS_DIR = path.resolve(__dirname, '../screenshots/final');
const TEMP_VIDEO_DIR = path.resolve(__dirname, '../recordings_temp');

[FINAL_SCREENSHOTS_DIR, TEMP_VIDEO_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(DIST_DIR, 'index.html')).pipe(res);
  }
});

/** Dismiss a Jack suit modal if visible (testID-based, see JackSuitModal.tsx) */
async function dismissJackModalIfOpen(page) {
  try {
    const jackTitle = page.locator('[data-testid^="suit-select-"]').first();
    if (await jackTitle.isVisible({ timeout: 500 })) {
      console.log('  Jack modal visible — selecting SPADES');
      await jackTitle.click();
      await page.waitForTimeout(600);
      return true;
    }
  } catch {}
  return false;
}

/** Play one human turn: play a card if possible, otherwise draw */
async function playOneTurn(page, label) {
  await page.waitForTimeout(800);
  const playable = page.locator('[data-testid="playable-card"]');
  const count = await playable.count().catch(() => 0);
  if (count > 0) {
    console.log(`  [${label}] Playing top playable card (${count} available)...`);
    await playable.first().click();
    await page.waitForTimeout(500);
    await dismissJackModalIfOpen(page);
  } else {
    console.log(`  [${label}] No playable cards — drawing from deck...`);
    const drawBtn = page.locator('[data-testid="draw-pile-btn"]').first();
    await drawBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(600);
  }
}

/** Wait for bot turns to complete (up to maxMs) */
async function waitForBots(page, maxMs = 3000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const isHuman = await page.getByText('HAND (').first().isVisible({ timeout: 300 }).catch(() => false);
    if (isHuman) break;
    await page.waitForTimeout(400);
  }
}

async function run() {
  server.listen(8089);
  console.log('Test review server listening on http://localhost:8089\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP A: Continuous walkthrough recording at 390×844 (iPhone-class viewport)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('=== STEP A: Continuous Walkthrough Recording (390×844) ===\n');
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: TEMP_VIDEO_DIR,
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();

  // ── 1. Home Screen ───────────────────────────────────────────────────────
  console.log('1. Home Screen...');
  await page.goto('http://localhost:8089', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '01_home_screen_390x844.png') });

  // ── 2. Match Setup ───────────────────────────────────────────────────────
  console.log('2. Match Setup...');
  await page.getByText('Match Setup').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '02_setup_screen_390x844.png') });

  // Select 4 players
  await page.getByText('4').first().click();
  await page.waitForTimeout(500);

  // ── 3. Deal & Start Round 1 ──────────────────────────────────────────────
  console.log('3. Dealing & Starting Match (Round 1)...');
  await page.getByText('DEAL CARDS & START MATCH').first().click();
  await page.waitForTimeout(2500); // deal animation
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '03_game_table_screen_390x844.png') });

  // ── 4. Gameplay: 6 human turns with bot waits ────────────────────────────
  console.log('4. Gameplay — card plays, draws, bot turns...');
  for (let turn = 1; turn <= 6; turn++) {
    await waitForBots(page, 3500);
    const isMyTurn = await page.getByText('HAND (').first().isVisible({ timeout: 500 }).catch(() => false);
    if (isMyTurn) {
      await playOneTurn(page, `turn ${turn}`);
    } else {
      console.log(`  [turn ${turn}] Waiting for bots...`);
    }
    await page.waitForTimeout(1500);
  }

  // ── 5. Open Scoreboard ───────────────────────────────────────────────────
  console.log('5. Scoreboard...');
  const scoreBtn = page.getByLabel('Open Scoreboard');
  if (await scoreBtn.first().isVisible({ timeout: 1000 }).catch(() => false)) {
    await scoreBtn.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '05_scoreboard_screen_390x844.png') });
    await page.getByText('BACK').first().click();
    await page.waitForTimeout(1000);
  }

  // ── 6. Open Rules ────────────────────────────────────────────────────────
  console.log('6. Rules Screen...');
  const rulesBtn = page.getByLabel('Open Rules');
  if (await rulesBtn.first().isVisible({ timeout: 1000 }).catch(() => false)) {
    await rulesBtn.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '04_rules_screen_390x844.png') });
    await page.getByText('BACK').first().click();
    await page.waitForTimeout(1200);
  }

  // ── 7. Continue playing until a round ends (up to 25 more turns) ─────────
  console.log('7. Continuing gameplay until a round ends...');
  let roundEnded = false;
  for (let t = 0; t < 25 && !roundEnded; t++) {
    await waitForBots(page, 3500);

    // Check for round-over modal
    const roundOverBtn = page.getByText('START NEXT ROUND');
    if (await roundOverBtn.first().isVisible({ timeout: 500 }).catch(() => false)) {
      console.log('  Round over! Capturing score breakdown...');
      await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '08_round_over_390x844.png') });
      await roundOverBtn.first().click();
      await page.waitForTimeout(1500);
      roundEnded = true;
      break;
    }

    // Check for game-over modal
    const gameOverBtn = page.getByText('PLAY AGAIN');
    if (await gameOverBtn.first().isVisible({ timeout: 500 }).catch(() => false)) {
      console.log('  Game over! Capturing final standings...');
      await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '09_game_over_390x844.png') });
      roundEnded = true;
      break;
    }

    const isMyTurn = await page.getByText('HAND (').first().isVisible({ timeout: 500 }).catch(() => false);
    if (isMyTurn) {
      await playOneTurn(page, `extra turn ${t + 1}`);
    }
    await page.waitForTimeout(1200);
  }

  // ── 8. History Screen ────────────────────────────────────────────────────
  // Navigate via UI: home button → history button (no page.goto() to avoid flash)
  console.log('8. History Screen (via UI navigation, test-fixture data)...');
  // Try the home/back button first
  const homeBtn = page.getByLabel('Go Home');
  const goHomeVisible = await homeBtn.first().isVisible({ timeout: 800 }).catch(() => false);
  if (goHomeVisible) {
    await homeBtn.first().click();
    await page.waitForTimeout(800);
  } else {
    // Try game-over replay button's dismiss or any BACK
    const backBtn = page.getByText('BACK').first();
    if (await backBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await backBtn.click();
      await page.waitForTimeout(600);
    }
    // Press home/back once more to reach HomeScreen
    const homeBtn2 = page.getByLabel('Go Home');
    if (await homeBtn2.first().isVisible({ timeout: 500 }).catch(() => false)) {
      await homeBtn2.first().click();
      await page.waitForTimeout(600);
    }
  }

  // Inject ONE clearly-labelled test-fixture match into localStorage
  // (so the history screen shows something demonstrable)
  await page.evaluate(() => {
    const fixture = {
      id: 'test-fixture-review-match',
      timestamp: Date.now() - 7200000,
      totalRounds: 3,
      winnerId: 'player-1',
      winnerName: 'You',
      // NOTE: syncedToFirebase is false here — it reflects the actual local state
      syncedToFirebase: false,
      _note: 'TEST FIXTURE — not genuine saved match',
      players: [
        { playerId: 'player-1', name: 'You', finalScore: 110, isWinner: true,  isEliminated: false },
        { playerId: 'player-2', name: 'Marcus', finalScore: 374, isWinner: false, isEliminated: false },
        { playerId: 'player-3', name: 'Sophia', finalScore: 219, isWinner: false, isEliminated: false },
        { playerId: 'player-4', name: 'Elena', finalScore: 503, isWinner: false, isEliminated: true },
      ],
    };
    try {
      localStorage.setItem('@outlast502_match_history', JSON.stringify([fixture]));
    } catch (e) {}
  });

  // Now navigate to History from the Home screen via UI
  await page.waitForTimeout(400);
  const historyBtn = page.getByText('Match History');
  if (await historyBtn.first().isVisible({ timeout: 1000 }).catch(() => false)) {
    await historyBtn.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '06_history_screen_390x844.png') });
    // Go back via UI
    await page.getByText('BACK').first().click().catch(() => {});
    await page.waitForTimeout(800);
  }

  await page.waitForTimeout(1000);

  // Flush and copy video
  const video = page.video();
  await context.close();

  if (video) {
    const videoPath = await video.path();
    console.log('\nVideo flushed to:', videoPath);
    if (fs.existsSync(videoPath)) {
      fs.copyFileSync(videoPath, OUTPUT_VIDEO_PATH);
      const stats = fs.statSync(OUTPUT_VIDEO_PATH);
      console.log(`Video copied: ${(stats.size / 1024 / 1024).toFixed(2)} MB → ${OUTPUT_VIDEO_PATH}`);
      console.log('Note: WebM has NO audio track — Playwright cannot capture browser AudioContext output.');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP B: Multi-viewport screenshot suite
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n=== STEP B: Multi-viewport screenshot suite ===\n');

  const viewports = [
    { label: '360x800',  width: 360,  height: 800  },  // Realme Note 50 (browser approx)
    { label: '375x812',  width: 375,  height: 812  },  // iPhone SE / 12 mini
    { label: '390x844',  width: 390,  height: 844  },  // iPhone 14
    { label: '393x873',  width: 393,  height: 873  },  // Pixel 8
    { label: '412x915',  width: 412,  height: 915  },  // Pixel 7
    { label: '430x932',  width: 430,  height: 932  },  // iPhone 14 Plus
  ];

  for (const vp of viewports) {
    console.log(`  Viewport ${vp.label}...`);
    const vpCtx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const vpPage = await vpCtx.newPage();

    // Home
    await vpPage.goto('http://localhost:8089', { waitUntil: 'networkidle' });
    await vpPage.waitForTimeout(600);
    await vpPage.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, `home_${vp.label}.png`) });

    // Start game quickly
    await vpPage.getByText('QUICK PLAY').first().click().catch(async () => {
      await vpPage.getByText('Match Setup').first().click().catch(() => {});
      await vpPage.waitForTimeout(400);
      await vpPage.getByText('DEAL CARDS & START MATCH').first().click().catch(() => {});
    });
    await vpPage.waitForTimeout(2000);
    await vpPage.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, `game_table_${vp.label}.png`) });

    await vpCtx.close();
  }

  // ── Stress test: 11-card hand at 360x800 ─────────────────────────────────
  console.log('\n  Stress test: 11-card hand at 360×800...');
  const stressCtx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const stressPage = await stressCtx.newPage();
  await stressPage.goto('http://localhost:8089', { waitUntil: 'networkidle' });
  await stressPage.waitForTimeout(600);

  // Start a game then draw several cards to build a large hand
  await stressPage.getByText('QUICK PLAY').first().click().catch(async () => {
    await stressPage.getByText('Match Setup').first().click().catch(() => {});
    await stressPage.waitForTimeout(400);
    await stressPage.getByText('DEAL CARDS & START MATCH').first().click().catch(() => {});
  });
  await stressPage.waitForTimeout(2000);

  // Draw from deck to inflate hand (up to 4 extra draws)
  for (let d = 0; d < 4; d++) {
    await waitForBots(stressPage, 2500);
    const isMyTurn = await stressPage.getByText('HAND (').first().isVisible({ timeout: 500 }).catch(() => false);
    if (isMyTurn) {
      const drawBtn = stressPage.locator('[data-testid="draw-pile-btn"]').first();
      await drawBtn.click({ force: true }).catch(() => {});
      await stressPage.waitForTimeout(700);
    }
  }
  await stressPage.waitForTimeout(800);
  await stressPage.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, 'stress_large_hand_360x800.png') });
  await stressCtx.close();

  // ── Desktop ──────────────────────────────────────────────────────────────
  console.log('  Desktop 1280×800...');
  const deskCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const deskPage = await deskCtx.newPage();
  await deskPage.goto('http://localhost:8089', { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(600);
  await deskPage.getByText('QUICK PLAY').first().click().catch(() => {});
  await deskPage.waitForTimeout(1500);
  await deskPage.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '07_desktop_1280x800.png') });
  await deskCtx.close();

  await browser.close();
  server.close();

  // ── Final summary ─────────────────────────────────────────────────────────
  console.log('\n=== Walkthrough complete ===\n');

  // Verify output video
  const stat = fs.existsSync(OUTPUT_VIDEO_PATH) ? fs.statSync(OUTPUT_VIDEO_PATH) : null;
  if (stat) {
    console.log(`✓ Video: ${OUTPUT_VIDEO_PATH}`);
    console.log(`  Size : ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Note : No audio track (Playwright cannot capture Web Audio output).`);
  } else {
    console.error('✗ Video file not found!');
  }

  // List screenshots
  const shots = fs.readdirSync(FINAL_SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));
  console.log(`\n✓ Screenshots (${shots.length} files in screenshots/final/):`);
  shots.forEach(f => {
    const size = fs.statSync(path.join(FINAL_SCREENSHOTS_DIR, f)).size;
    console.log(`  ${f.padEnd(48)} ${(size / 1024).toFixed(0)} KB`);
  });

  console.log('\nPhysical Android / Realme Note 50 validation: NOT performed by this script.');
  console.log('History data: ONE test-fixture record (labelled, not genuine saved gameplay).');
  console.log('Firebase: cloudActive shown only when Firestore returns real records.');
}

run().catch(err => {
  console.error('Recording script error:', err);
  if (server.listening) server.close();
  process.exit(1);
});
