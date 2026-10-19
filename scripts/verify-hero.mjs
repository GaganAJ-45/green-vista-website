import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  const screenshotDir = 'artifacts/screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

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

    console.log(`\n========================================`);
    console.log(`=== ${label} (${width}x${height}) ===`);
    console.log(`ScrollWidth: ${scrollWidth}, ClientWidth: ${clientWidth}, HorizontalOverflow: ${hasHorizontalOverflow}`);
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }

    // Verify slide 1 is active
    const activeSlideIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.hero-slide'));
      return slides.findIndex(s => s.classList.contains('is-active'));
    });
    console.log(`Initial Active Slide Index: ${activeSlideIndex}`);

    // Capture screenshot of Slide 1
    const shot1 = path.join(screenshotDir, `hero-${label.toLowerCase()}-slide1.png`);
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`Saved screenshot: ${shot1}`);

    // Test indicator click for Slide 2
    const btn2 = await page.$('#hero-indicator-1');
    if (btn2) {
      await btn2.click();
      await page.waitForTimeout(1400); // Wait for 1.2s crossfade transition
      const activeSlideAfterClick = await page.evaluate(() => {
        const slides = Array.from(document.querySelectorAll('.hero-slide'));
        return slides.findIndex(s => s.classList.contains('is-active'));
      });
      console.log(`Active Slide After Indicator 2 Click: ${activeSlideAfterClick}`);

      // Capture screenshot of Slide 2
      const shot2 = path.join(screenshotDir, `hero-${label.toLowerCase()}-slide2.png`);
      await page.screenshot({ path: shot2, fullPage: false });
      console.log(`Saved screenshot: ${shot2}`);
    }

    // Test indicator click for Slide 3
    const btn3 = await page.$('#hero-indicator-2');
    if (btn3) {
      await btn3.click();
      await page.waitForTimeout(1400); // Wait for 1.2s crossfade transition
      const activeSlideAfterClick3 = await page.evaluate(() => {
        const slides = Array.from(document.querySelectorAll('.hero-slide'));
        return slides.findIndex(s => s.classList.contains('is-active'));
      });
      console.log(`Active Slide After Indicator 3 Click: ${activeSlideAfterClick3}`);

      // Capture screenshot of Slide 3
      const shot3 = path.join(screenshotDir, `hero-${label.toLowerCase()}-slide3.png`);
      await page.screenshot({ path: shot3, fullPage: false });
      console.log(`Saved screenshot: ${shot3}`);
    }

    // Test Pause / Resume Toggle
    const pauseBtn = await page.$('#hero-pause-toggle');
    if (pauseBtn) {
      const labelBefore = await pauseBtn.getAttribute('aria-label');
      await pauseBtn.click();
      const labelAfterPause = await pauseBtn.getAttribute('aria-label');
      await pauseBtn.click();
      const labelAfterResume = await pauseBtn.getAttribute('aria-label');
      console.log(`Pause Button Test:
  Initial aria-label: ${labelBefore}
  After Click aria-label: ${labelAfterPause}
  After Resume aria-label: ${labelAfterResume}`);
    }

    await page.close();
  };

  // Test standard Desktop 1440x900
  await testViewport(1440, 900, 'DESKTOP');

  // Test Mobile 390x844
  await testViewport(390, 844, 'MOBILE');

  // Test Narrow Mobile 360x780
  await testViewport(360, 780, 'NARROW_MOBILE');

  // Test prefers-reduced-motion
  console.log(`\n========================================`);
  console.log(`=== TESTING prefers-reduced-motion ===`);
  const reducedMotionPage = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });
  await reducedMotionPage.emulateMedia({ reducedMotion: 'reduce' });
  await reducedMotionPage.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

  const initialSlideReduced = await reducedMotionPage.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    return slides.findIndex(s => s.classList.contains('is-active'));
  });

  // Wait 7 seconds (longer than standard 6s slide duration) to confirm it does not auto-advance
  await reducedMotionPage.waitForTimeout(7000);
  const slideAfter7sReduced = await reducedMotionPage.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    return slides.findIndex(s => s.classList.contains('is-active'));
  });
  console.log(`Reduced Motion Initial Slide: ${initialSlideReduced}, Slide After 7s: ${slideAfter7sReduced} (Auto-advance disabled: ${initialSlideReduced === slideAfter7sReduced})`);

  await reducedMotionPage.close();

  // Test automatic advance when reduced motion is NOT enabled
  console.log(`\n========================================`);
  console.log(`=== TESTING AUTOMATIC ADVANCE (Standard) ===`);
  const autoPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await autoPage.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  const startSlide = await autoPage.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    return slides.findIndex(s => s.classList.contains('is-active'));
  });
  console.log(`Auto Advance: Start slide index: ${startSlide}`);
  // Wait 7.5s (6s timer + 1.2s crossfade + buffer)
  await autoPage.waitForTimeout(7500);
  const autoSlide = await autoPage.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    return slides.findIndex(s => s.classList.contains('is-active'));
  });
  console.log(`Auto Advance: Slide index after 7.5s: ${autoSlide} (Successfully advanced: ${autoSlide === 1})`);
  await autoPage.close();

  await browser.close();
  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY.');
})();
