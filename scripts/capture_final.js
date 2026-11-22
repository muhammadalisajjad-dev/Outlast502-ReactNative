const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 8095;
const OUT = path.resolve(__dirname, '../screenshots/final');
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { w: 360, h: 800 },
  { w: 390, h: 844 },
  { w: 430, h: 932 },
  { w: 1280, h: 800 },
];

async function shot(page, label, vp) {
  const name = `${label}_${vp.w}x${vp.h}.png`;
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
  console.log('saved', name);
}

async function runForViewport(browser, vp) {
  const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.w < 800, hasTouch: vp.w < 800 });
  const page = await context.newPage();
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await shot(page, '01_home', vp);

  // Setup
  await page.getByText('Table', { exact: true }).first().click();
  await page.waitForTimeout(400);
  await shot(page, '02_setup', vp);

  // Start a 2-seat match
  await page.getByText(/^duel$/i).first().click().catch(() => {});
  await page.waitForTimeout(200);
  await page.getByText(/Deal cards/i).first().click();
  await page.waitForTimeout(1500);
  await shot(page, '03_gameplay_hand', vp);

  // Play a few turns to get a special-card state
  for (let i = 0; i < 8; i++) {
    const playable = page.locator('[data-testid="playable-card"]');
    if (await playable.count() > 0) {
      await playable.nth((await playable.count()) - 1).click({ position: { x: 18, y: 34 }, force: true }).catch(() => {});
      await page.waitForTimeout(700);
    } else {
      const draw = page.locator('[data-testid="draw-pile-btn"]');
      if (await draw.count() > 0) { await draw.first().click().catch(() => {}); await page.waitForTimeout(700); }
      else break;
    }
  }
  await shot(page, '04_gameplay_special', vp);

  // Back to home then scoreboard
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await shot(page, '01_home', vp);
  // nav to scoreboard
  await page.getByText('Standings', { exact: true }).first().click();
  await page.waitForTimeout(500);
  await shot(page, '05_scoreboard', vp);

  // history
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.getByText('Archive', { exact: true }).first().click();
  await page.waitForTimeout(800);
  await shot(page, '06_history', vp);

  // rules
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.getByText('Rules', { exact: true }).first().click();
  await page.waitForTimeout(500);
  await shot(page, '07_rules', vp);

  await context.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe', headless: true });
  for (const vp of VIEWPORTS) {
    await runForViewport(browser, vp);
  }
  await browser.close();
  console.log('done');
})();
