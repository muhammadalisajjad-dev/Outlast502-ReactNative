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

const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '375x812', width: 375, height: 812 },
  { name: '390x844', width: 390, height: 844 },
  { name: '412x915', width: 412, height: 915 },
  { name: '430x932', width: 430, height: 932 },
];

async function seedHistory(page) {
  await page.evaluate(() => {
    const sampleRecord = {
      id: 'match-demo-1',
      timestamp: Date.now() - 3600000,
      totalRounds: 4,
      winnerId: 'player-1',
      winnerName: 'You',
      players: [
        { playerId: 'player-1', name: 'You', finalScore: 68, isWinner: true, isEliminated: false },
        { playerId: 'player-2', name: 'Marcus', finalScore: 504, isWinner: false, isEliminated: true },
        { playerId: 'player-3', name: 'Sophia', finalScore: 242, isWinner: false, isEliminated: false },
        { playerId: 'player-4', name: 'Elena', finalScore: 310, isWinner: false, isEliminated: false },
      ],
      syncedToFirebase: true,
    };
    try {
      localStorage.setItem('@outlast502_match_history', JSON.stringify([sampleRecord]));
    } catch (e) {}
  });
}

async function captureViewport(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const tag = viewport.name;

  await page.goto('http://localhost:8086', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  console.log(`Capturing home (${tag})`);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `01_home_screen_${tag}.png`) });

  console.log(`Capturing setup (${tag})`);
  await page.getByText('THE TABLE').first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `02_setup_screen_${tag}.png`) });

  console.log(`Capturing game table (${tag})`);
  await page.getByText(/DEAL THE CARDS/).first().click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `03_game_table_screen_${tag}.png`) });

  console.log(`Capturing rules (${tag})`);
  await page.getByLabel('Open Rules').first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `04_rules_screen_${tag}.png`) });

  console.log(`Capturing scoreboard (${tag})`);
  await page.getByText('BACK').first().click();
  await page.waitForTimeout(600);
  await page.getByLabel('Open Scoreboard').first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `05_scoreboard_screen_${tag}.png`) });

  console.log(`Capturing history (${tag})`);
  await page.goto('http://localhost:8086', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await seedHistory(page);
  await page.getByText('THE ARCHIVE').first().click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `06_history_screen_${tag}.png`) });

  await context.close();
}

async function captureDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:8086', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  console.log('Capturing desktop home');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_home_screen_desktop.png') });

  console.log('Capturing desktop game table');
  await page.getByText('TAKE A SEAT').first().click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_game_table_screen_desktop.png') });
  await context.close();
}

async function run() {
  server.listen(8086);
  console.log('Static test server listening on http://localhost:8086');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  for (const viewport of VIEWPORTS) {
    await captureViewport(browser, viewport);
  }

  await captureDesktop(browser);

  await browser.close();
  server.close();
  console.log('\nAll visual inspection screenshots captured successfully!');
}

run().catch(err => {
  console.error('Screenshot capture error:', err);
  if (server) server.close();
  process.exit(1);
});
