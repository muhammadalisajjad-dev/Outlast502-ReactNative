const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '../dist');
const RECORDINGS_DIR = path.resolve(__dirname, '../recordings');
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
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

async function run() {
  server.listen(8086);
  console.log('Server running on http://localhost:8086');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();
  console.log('Recording video of gameplay...');

  await page.goto('http://localhost:8086', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Setup match
  const setupBtn = page.getByText('Custom Match Setup');
  if (await setupBtn.count() > 0) {
    await setupBtn.first().click();
    await page.waitForTimeout(1200);

    // Pick 3 players
    const count3 = page.getByText('3', { exact: true });
    if (await count3.count() > 0) {
      await count3.first().click();
      await page.waitForTimeout(800);
    }

    const startBtn = page.getByText('Deal Cards & Start Match');
    await startBtn.first().click();
    await page.waitForTimeout(2000);
  } else {
    await page.getByText('Quick Play').first().click();
    await page.waitForTimeout(2000);
  }

  // Play several turns
  for (let step = 0; step < 8; step++) {
    await page.waitForTimeout(1800);

    // Check if Jack suit modal is open
    const suitHearts = page.getByText('Hearts');
    if (await suitHearts.count() > 0) {
      await suitHearts.first().click();
      await page.waitForTimeout(1000);
    }

    // Check if penalty modal is active
    const drawPenalty = page.getByText('Draw');
    if (await drawPenalty.count() > 0) {
      await drawPenalty.first().click();
      await page.waitForTimeout(1200);
      continue;
    }

    // Check if it's our turn
    const yourTurn = page.getByText('YOUR TURN');
    if (await yourTurn.count() > 0) {
      // Look for a playable card or tap to draw
      const tapToDraw = page.getByText('Tap to Draw');
      if (await tapToDraw.count() > 0) {
        await tapToDraw.first().click();
        await page.waitForTimeout(1500);
      }
    }
  }

  // Check scoreboard
  const scoreBtn = page.getByText('📊');
  if (await scoreBtn.count() > 0) {
    await scoreBtn.first().click();
    await page.waitForTimeout(2000);
    await page.getByText('← Back').first().click();
    await page.waitForTimeout(1000);
  }

  // Check rules
  const rulesBtn = page.getByText('📖');
  if (await rulesBtn.count() > 0) {
    await rulesBtn.first().click();
    await page.waitForTimeout(2000);
    await page.getByText('← Back').first().click();
    await page.waitForTimeout(1000);
  }

  // Save video
  await page.close();
  await context.close();
  await browser.close();
  server.close();

  // Rename video file to gameplay_demo.webm
  const files = fs.readdirSync(RECORDINGS_DIR).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const original = path.join(RECORDINGS_DIR, files[0]);
    const target = path.join(RECORDINGS_DIR, 'outlast502_gameplay_demo.webm');
    fs.copyFileSync(original, target);
    console.log(`Video saved to: ${target}`);
  }

  console.log('Recording completed successfully!');
}

run().catch(err => {
  console.error('Recording error:', err);
  if (server) server.close();
  process.exit(1);
});
