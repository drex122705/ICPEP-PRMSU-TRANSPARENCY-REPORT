const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app and wait for it to load
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Wait a bit for initial render and 3D stuff (though we only care about dashboard)
  await page.waitForTimeout(2000);

  // Scroll to the bottom to see the dashboard
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000); // Wait for scroll / lenis

  // Click the "Ingest / Sync" button
  await page.click('button:has-text("Ingest / Sync")');

  // Wait for the modal to appear
  await page.waitForSelector('text="Automated Document Ingestion & Sync"');
  await page.waitForTimeout(1000); // Let animation finish if any

  // Take a screenshot of the modal
  await page.screenshot({ path: 'modal.png' });

  await browser.close();
})();
