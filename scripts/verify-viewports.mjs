import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  const testViewport = async (width, height, label) => {
    const page = await browser.newPage({ viewport: { width, height } });
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const hasHorizontalOverflow = scrollWidth > clientWidth;

    console.log(`=== ${label} (${width}x${height}) ===`);
    console.log(`ScrollWidth: ${scrollWidth}, ClientWidth: ${clientWidth}, HorizontalOverflow: ${hasHorizontalOverflow}`);
    console.log(`Console Errors: ${consoleErrors.length}`);

    if (width < 960) {
      const toggle = await page.$('#nav-toggle');
      const toggleDisplay = await page.evaluate(el => window.getComputedStyle(el).display, toggle);
      const expandedInitial = await toggle.getAttribute('aria-expanded');

      // Click to open
      await toggle.click();
      const expandedOpened = await toggle.getAttribute('aria-expanded');
      const navDisplayOpened = await page.evaluate(() => {
        const nav = document.getElementById('main-nav');
        return window.getComputedStyle(nav).display;
      });
      const bodyOverflowOpened = await page.evaluate(() => document.body.style.overflow);

      // Escape to close
      await page.keyboard.press('Escape');
      const expandedClosed = await toggle.getAttribute('aria-expanded');
      const navDisplayClosed = await page.evaluate(() => {
        const nav = document.getElementById('main-nav');
        return window.getComputedStyle(nav).display;
      });
      const bodyOverflowClosed = await page.evaluate(() => document.body.style.overflow);

      console.log(`Mobile Nav Test:
  Toggle Display: ${toggleDisplay}
  Initial aria-expanded: ${expandedInitial}
  After Click aria-expanded: ${expandedOpened}
  Nav Display When Open: ${navDisplayOpened}
  Body Overflow When Open: ${bodyOverflowOpened}
  After Escape aria-expanded: ${expandedClosed}
  Nav Display When Closed: ${navDisplayClosed}
  Body Overflow When Closed: ${bodyOverflowClosed}`);
    } else {
      const navDisplay = await page.evaluate(() => {
        const nav = document.getElementById('main-nav');
        return window.getComputedStyle(nav).display;
      });
      const toggleDisplay = await page.evaluate(() => {
        const toggle = document.getElementById('nav-toggle');
        return window.getComputedStyle(toggle).display;
      });
      const ctaDisplay = await page.evaluate(() => {
        const cta = document.querySelector('.btn-consultation');
        return cta ? window.getComputedStyle(cta).display : 'none';
      });
      console.log(`Desktop Nav Test:
  Nav Display: ${navDisplay}
  Toggle Display: ${toggleDisplay}
  CTA Button Display: ${ctaDisplay}`);
    }

    await page.close();
  };

  await testViewport(1440, 900, 'DESKTOP');
  await testViewport(390, 844, 'MOBILE');

  await browser.close();
  console.log('ALL BROWSER TESTS COMPLETE');
})();
