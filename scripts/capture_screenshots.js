const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '../dist');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../screenshots');

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
  server.listen(8086);
  console.log('Static test server listening on http://localhost:8086');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  // Cycle 1: Standard iPhone 14 / modern mobile viewport (390x844 @2x)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  console.log('Navigating to Home...');
  await page.goto('http://localhost:8086', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Home Screen
  console.log('Capturing 01_home_screen.png (390x844)');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_home_screen.png') });

  // 2. Setup Screen
  console.log('Navigating to Setup...');
  const setupBtn = page.getByText('Match Setup');
  await setupBtn.first().click();
  await page.waitForTimeout(600);
  console.log('Capturing 02_setup_screen.png (390x844)');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_setup_screen.png') });

  // Start game from setup
  const startBtn = page.getByText('DEAL CARDS & START MATCH');
  await startBtn.first().click();
  await page.waitForTimeout(1200);

  // 3. Game Table Screen
  console.log('Capturing 03_game_table_screen.png (390x844)');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_game_table_screen.png') });

  // 4. Rules Screen (via header button)
  console.log('Opening Rules...');
  const rulesBtn = page.getByLabel('Open Rules');
  await rulesBtn.first().click();
  await page.waitForTimeout(600);
  console.log('Capturing 04_rules_screen.png (390x844)');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_rules_screen.png') });

  // Back to table
  const backBtn = page.getByText('BACK');
  await backBtn.first().click();
  await page.waitForTimeout(600);

  // 5. Scoreboard Screen
  console.log('Opening Scoreboard...');
  const scoreBtn = page.getByLabel('Open Scoreboard');
  await scoreBtn.first().click();
  await page.waitForTimeout(600);
  console.log('Capturing 05_scoreboard_screen.png (390x844)');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_scoreboard_screen.png') });

  // Back to home & open History
  console.log('Navigating to History...');
  await page.goto('http://localhost:8086', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const historyBtn = page.getByText('Match History');
  await historyBtn.first().click();
  await page.waitForTimeout(600);
  console.log('Capturing 06_history_screen.png (390x844)');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_history_screen.png') });

  await context.close();

  // Cycle 2: Large flagship mobile viewport (430x932 @2x - iPhone 14/15/16 Pro Max)
  console.log('\n--- Cycle 2: Large Viewport (430x932) ---');
  const maxContext = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const maxPage = await maxContext.newPage();
  await maxPage.goto('http://localhost:8086', { waitUntil: 'networkidle' });
  await maxPage.waitForTimeout(800);

  // Quick Play into game table
  const quickPlayBtn = maxPage.getByText('QUICK PLAY');
  await quickPlayBtn.first().click();
  await maxPage.waitForTimeout(1200);
  console.log('Capturing 03_game_table_screen_430x932.png');
  await maxPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_game_table_screen_430x932.png') });

  await maxContext.close();

  // Desktop check (1280x800)
  console.log('\n--- Desktop Responsiveness Check (1280x800) ---');
  const deskContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const deskPage = await deskContext.newPage();
  await deskPage.goto('http://localhost:8086', { waitUntil: 'networkidle' });
  await deskPage.waitForTimeout(800);
  const deskQuickPlay = deskPage.getByText('QUICK PLAY');
  await deskQuickPlay.first().click();
  await deskPage.waitForTimeout(1200);
  console.log('Capturing 03_game_table_desktop.png');
  await deskPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_game_table_desktop.png') });
  await deskContext.close();

  await browser.close();
  server.close();
  console.log('\nAll visual inspection screenshots captured successfully!');
}

run().catch(err => {
  console.error('Screenshot capture error:', err);
  if (server) server.close();
  process.exit(1);
});
