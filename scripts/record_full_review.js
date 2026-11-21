const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '../dist');
const OUTPUT_VIDEO_PATH = 'C:\\Users\\hp\\Downloads\\OUTLAST502-UI-REVIEW.webm';
const FINAL_SCREENSHOTS_DIR = path.resolve(__dirname, '../screenshots/final');
const TEMP_VIDEO_DIR = path.resolve(__dirname, '../recordings_temp');

if (!fs.existsSync(FINAL_SCREENSHOTS_DIR)) {
  fs.mkdirSync(FINAL_SCREENSHOTS_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_VIDEO_DIR)) {
  fs.mkdirSync(TEMP_VIDEO_DIR, { recursive: true });
}

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
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

async function run() {
  server.listen(8089);
  console.log('Test review server listening on http://localhost:8089');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'],
  });

  // Step A: Record continuous video at 390x844 (Mobile Viewport)
  console.log('\n--- Starting UI Review Walkthrough Recording (390x844) ---');
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

  // 1. Home Screen
  console.log('1. Home Screen inspection...');
  await page.goto('http://localhost:8089', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '01_home_screen_390x844.png') });

  // 2. Match Setup
  console.log('2. Opening Match Setup...');
  const setupBtn = page.getByText('Match Setup');
  await setupBtn.first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '02_setup_screen_390x844.png') });

  // Select 4 players
  const seatBtn = page.getByText('4');
  await seatBtn.first().click();
  await page.waitForTimeout(600);

  // 3. Deal Cards & Start Match
  console.log('3. Dealing cards & Starting Match...');
  const startBtn = page.getByText('DEAL CARDS & START MATCH');
  await startBtn.first().click();
  
  // Watch card dealing animation (staggered flight from center to players)
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '03_game_table_screen_390x844.png') });

  // 4. Interactive Card Play & Drawing
  console.log('4. Playing & Drawing cards on table...');
  for (let turn = 0; turn < 4; turn++) {
    await page.waitForTimeout(1200);

    // Check if human turn
    const isHumanTurn = await page.getByText('HAND (').first().isVisible().catch(() => false);
    if (isHumanTurn) {
      // Check for playable card
      const playableCards = page.locator('[data-testid="playable-card"]');
      const count = await playableCards.count().catch(() => 0);
      if (count > 0) {
        console.log(`Found ${count} playable card(s). Playing top playable card...`);
        await playableCards.first().click();
        await page.waitForTimeout(600);

        // Check if Jack suit modal appeared
        const jackModal = page.getByText('JACK DECLARED');
        const isJack = await jackModal.first().isVisible().catch(() => false);
        if (isJack) {
          console.log('Jack Modal appeared! Selecting demanded suit...');
          const suitBtn = page.locator('[data-testid^="suit-select-"]').first();
          if (await suitBtn.isVisible().catch(() => false)) {
            await suitBtn.click();
          }
          await page.waitForTimeout(800);
        }
      } else {
        // Draw from deck
        const drawBtn = page.locator('[data-testid="draw-pile-btn"]').first();
        const canClickDraw = await page.getByText('DRAW').first().isVisible().catch(() => false);
        if (canClickDraw) {
          console.log('No playable card, drawing from deck (+1)...');
          await drawBtn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(800);
        }
      }
    }

    // Allow bot turns to proceed with visible motion
    await page.waitForTimeout(2000);
  }

  // 5. Scoreboard Screen
  console.log('5. Viewing Live Scoreboard...');
  const scoreBtn = page.getByLabel('Open Scoreboard');
  await scoreBtn.first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '05_scoreboard_screen_390x844.png') });

  // Back to game
  const backBtnScore = page.getByText('BACK');
  await backBtnScore.first().click();
  await page.waitForTimeout(1000);

  // 6. Rules Screen
  console.log('6. Viewing Official Rules...');
  const rulesBtn = page.getByLabel('Open Rules');
  await rulesBtn.first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '04_rules_screen_390x844.png') });

  // Back to game
  const backBtnRules = page.getByText('BACK');
  await backBtnRules.first().click();
  await page.waitForTimeout(1000);

  // 7. Seed sample finished match & inspect Match History
  console.log('7. Returning to Home and inspecting Match History...');
  await page.goto('http://localhost:8089', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    const sampleRecord = {
      id: 'match-review-1',
      timestamp: Date.now() - 1800000,
      totalRounds: 5,
      winnerId: 'player-1',
      winnerName: 'You',
      players: [
        { playerId: 'player-1', name: 'You', finalScore: 82, isWinner: true, isEliminated: false },
        { playerId: 'player-2', name: 'Marcus', finalScore: 508, isWinner: false, isEliminated: true },
        { playerId: 'player-3', name: 'Sophia', finalScore: 312, isWinner: false, isEliminated: false },
        { playerId: 'player-4', name: 'Elena', finalScore: 418, isWinner: false, isEliminated: false },
      ],
      syncedToFirebase: true,
    };
    try {
      localStorage.setItem('@outlast502_match_history', JSON.stringify([sampleRecord]));
    } catch (e) {}
  });

  const historyBtn = page.getByText('Match History');
  await historyBtn.first().click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '06_history_screen_390x844.png') });

  await page.waitForTimeout(1200);

  // Close context to flush video
  const video = page.video();
  await context.close();

  if (video) {
    const videoPath = await video.path();
    console.log('Video saved by Playwright to:', videoPath);
    if (fs.existsSync(videoPath)) {
      fs.copyFileSync(videoPath, OUTPUT_VIDEO_PATH);
      console.log('Copied review video directly to:', OUTPUT_VIDEO_PATH);
      const stats = fs.statSync(OUTPUT_VIDEO_PATH);
      console.log(`Video confirmed: ${stats.size} bytes (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    }
  }

  // Step B: Inspect Compact Android Layout (360x800 — Realme Note 50)
  console.log('\n--- Capturing Compact Android (360x800 — Realme Note 50) ---');
  const note50Context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const note50Page = await note50Context.newPage();

  // Home 360x800
  await note50Page.goto('http://localhost:8089', { waitUntil: 'networkidle' });
  await note50Page.waitForTimeout(800);
  await note50Page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '01_home_screen_360x800.png') });

  // Setup 360x800
  const note50Setup = note50Page.getByText('Match Setup');
  await note50Setup.first().click();
  await note50Page.waitForTimeout(800);
  await note50Page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '02_setup_screen_360x800.png') });

  // Game table 360x800
  const note50Start = note50Page.getByText('DEAL CARDS & START MATCH');
  await note50Start.first().click();
  await note50Page.waitForTimeout(1500);
  await note50Page.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '03_game_table_screen_360x800.png') });

  await note50Context.close();

  // Step C: Desktop Responsiveness (1280x800)
  console.log('\n--- Capturing Desktop Responsiveness (1280x800) ---');
  const deskContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const deskPage = await deskContext.newPage();
  await deskPage.goto('http://localhost:8089', { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(800);
  const deskQuickPlay = deskPage.getByText('QUICK PLAY');
  await deskQuickPlay.first().click();
  await deskPage.waitForTimeout(1400);
  await deskPage.screenshot({ path: path.join(FINAL_SCREENSHOTS_DIR, '07_desktop_1280x800.png') });
  await deskContext.close();

  await browser.close();
  server.close();
  console.log('\nReview video and screenshot suite completed successfully!');
}

run().catch(err => {
  console.error('Walkthrough recording error:', err);
  if (server) server.close();
  process.exit(1);
});
