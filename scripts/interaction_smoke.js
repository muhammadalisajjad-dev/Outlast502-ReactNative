const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST_DIR = path.resolve(__dirname, '../dist');
const SHOTS = path.resolve(__dirname, '../screenshots');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.ico': 'image/x-icon', '.png': 'image/png' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(DIST_DIR, 'index.html')).pipe(res);
  }
});

async function run() {
  server.listen(8088);
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
  const errors = [];
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto('http://localhost:8088', { waitUntil: 'networkidle' });
  await page.getByText('TAKE A SEAT').first().click();
  await page.waitForTimeout(1400);

  const playable = page.locator('[data-testid="playable-card"]');
  const playableCount = await playable.count();
  console.log(`Playable cards on opening turn: ${playableCount}`);

  if (playableCount > 0) {
    await playable.first().click();
    await page.waitForTimeout(700);

    const suitChoice = page.locator('[data-testid="suit-select-spades"]');
    if ((await suitChoice.count()) > 0) {
      console.log('Jack played — confirmed a demanded suit');
      await suitChoice.first().click();
      await page.waitForTimeout(500);
    } else {
      console.log('Played a card');
    }
  } else {
    await page.locator('[data-testid="draw-pile-btn"]').first().click();
    await page.waitForTimeout(900);
    console.log('Drew a card');
  }

  await page.screenshot({ path: path.join(SHOTS, '07_game_after_action_390x844.png') });

  await page.getByLabel('Open Scoreboard').first().click();
  await page.waitForTimeout(500);
  await page.getByText('BACK').first().click();
  await page.waitForTimeout(500);
  await page.getByLabel('Open Rules').first().click();
  await page.waitForTimeout(500);
  await page.getByText('BACK').first().click();
  await page.waitForTimeout(500);

  // Six-seat table layout
  await page.goto('http://localhost:8088', { waitUntil: 'networkidle' });
  await page.getByText('THE TABLE').first().click();
  await page.waitForTimeout(500);
  await page.getByText('FULL HOUSE').first().click();
  await page.waitForTimeout(400);
  await page.getByText(/DEAL THE CARDS/).first().click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(SHOTS, '03_game_table_6p_390x844.png') });

  // Two-seat table layout
  await page.goto('http://localhost:8088', { waitUntil: 'networkidle' });
  await page.getByText('THE TABLE').first().click();
  await page.waitForTimeout(500);
  await page.getByText('DUEL').first().click();
  await page.waitForTimeout(400);
  await page.getByText(/DEAL THE CARDS/).first().click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(SHOTS, '03_game_table_2p_390x844.png') });

  await context.close();
  await browser.close();
  server.close();

  if (errors.length) {
    console.log('BROWSER ERRORS:');
    errors.forEach(e => console.log(`- ${e}`));
    process.exitCode = 1;
  } else {
    console.log('No browser errors detected');
  }
}

run().catch(err => {
  console.error(err);
  server.close();
  process.exit(1);
});
