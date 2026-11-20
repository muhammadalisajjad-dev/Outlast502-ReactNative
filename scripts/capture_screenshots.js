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

// Start simple static HTTP server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(DIST_DIR, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

async function run() {
  server.listen(8085);
  console.log('Static server listening on http://localhost:8085');

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

  console.log('Navigating to app...');
  await page.goto('http://localhost:8085', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Home Screen
  console.log('Capturing 01_home_screen.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_home_screen.png') });

  // 2. Setup Screen
  console.log('Navigating to Setup...');
  const setupBtn = page.getByText('Custom Match Setup');
  if (await setupBtn.count() > 0) {
    await setupBtn.first().click();
    await page.waitForTimeout(600);
    console.log('Capturing 02_setup_screen.png');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_setup_screen.png') });

    // Start game
    const startBtn = page.getByText('Deal Cards & Start Match');
    await startBtn.first().click();
    await page.waitForTimeout(1200);
  } else {
    const quickPlay = page.getByText('Quick Play');
    await quickPlay.first().click();
    await page.waitForTimeout(1200);
  }

  // 3. Game Table Screen
  console.log('Capturing 03_game_table_screen.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_game_table_screen.png') });

  // 4. Rules Screen
  console.log('Opening Rules...');
  const rulesBtn = page.getByText('📖');
  if (await rulesBtn.count() > 0) {
    await rulesBtn.first().click();
    await page.waitForTimeout(600);
    console.log('Capturing 04_rules_screen.png');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_rules_screen.png') });

    // Back to table
    const backBtn = page.getByText('← Back');
    await backBtn.first().click();
    await page.waitForTimeout(600);
  }

  // 5. Scoreboard Screen
  console.log('Opening Scoreboard...');
  const scoreBtn = page.getByText('📊');
  if (await scoreBtn.count() > 0) {
    await scoreBtn.first().click();
    await page.waitForTimeout(600);
    console.log('Capturing 05_scoreboard_screen.png');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_scoreboard_screen.png') });

    // Back to table
    const backBtn = page.getByText('← Back');
    await backBtn.first().click();
    await page.waitForTimeout(600);
  }

  // Go Home and visit History
  console.log('Visiting History...');
  await page.goto('http://localhost:8085', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const historyBtn = page.getByText('Match History & Cloud Records');
  if (await historyBtn.count() > 0) {
    await historyBtn.first().click();
    await page.waitForTimeout(600);
    console.log('Capturing 06_history_screen.png');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_history_screen.png') });
  }

  await browser.close();
  server.close();
  console.log('All screenshots captured successfully!');
}

run().catch(err => {
  console.error('Screenshot error:', err);
  if (server) server.close();
  process.exit(1);
});
