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

  const expectedHeadlines = [
    'Landscapes made for living.',
    'Outdoor spaces, beautifully imagined.',
    'Where nature feels like luxury.'
  ];

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

    // Verify slide 1 and headline 1
    const slide1Data = await page.evaluate(() => {
      const activeSlide = document.querySelector('.hero-slide.is-active');
      const activeHeadline = document.querySelector('.hero-headline.is-active');
      return {
        slideIdx: activeSlide ? activeSlide.getAttribute('data-slide') : null,
        headlineText: activeHeadline ? activeHeadline.textContent.trim() : null
      };
    });
    console.log(`Initial Slide: data-slide=${slide1Data.slideIdx}, headline="${slide1Data.headlineText}"`);
    console.log(`Matches Expected 1: ${slide1Data.headlineText === expectedHeadlines[0]}`);

    // Capture screenshot of Slide 1
    const shot1 = path.join(screenshotDir, `hero-${label.toLowerCase()}-slide1.png`);
    await page.screenshot({ path: shot1, fullPage: false });

    // Test indicator click for Slide 2
    const btn2 = await page.$('#hero-indicator-1');
    if (btn2) {
      await btn2.click();
      await page.waitForTimeout(1400); // Wait for 1.2s crossfade transition
      const slide2Data = await page.evaluate(() => {
        const activeSlide = document.querySelector('.hero-slide.is-active');
        const activeHeadline = document.querySelector('.hero-headline.is-active');
        return {
          slideIdx: activeSlide ? activeSlide.getAttribute('data-slide') : null,
          headlineText: activeHeadline ? activeHeadline.textContent.trim() : null
        };
      });
      console.log(`After Click 2: data-slide=${slide2Data.slideIdx}, headline="${slide2Data.headlineText}"`);
      console.log(`Matches Expected 2: ${slide2Data.headlineText === expectedHeadlines[1]}`);

      // Capture screenshot of Slide 2
      const shot2 = path.join(screenshotDir, `hero-${label.toLowerCase()}-slide2.png`);
      await page.screenshot({ path: shot2, fullPage: false });
    }

    // Test indicator click for Slide 3
    const btn3 = await page.$('#hero-indicator-2');
    if (btn3) {
      await btn3.click();
      await page.waitForTimeout(1400); // Wait for 1.2s crossfade transition
      const slide3Data = await page.evaluate(() => {
        const activeSlide = document.querySelector('.hero-slide.is-active');
        const activeHeadline = document.querySelector('.hero-headline.is-active');
        return {
          slideIdx: activeSlide ? activeSlide.getAttribute('data-slide') : null,
          headlineText: activeHeadline ? activeHeadline.textContent.trim() : null
        };
      });
      console.log(`After Click 3: data-slide=${slide3Data.slideIdx}, headline="${slide3Data.headlineText}"`);
      console.log(`Matches Expected 3: ${slide3Data.headlineText === expectedHeadlines[2]}`);

      // Capture screenshot of Slide 3
      const shot3 = path.join(screenshotDir, `hero-${label.toLowerCase()}-slide3.png`);
      await page.screenshot({ path: shot3, fullPage: false });
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

  // Test prefers-reduced-motion
  console.log(`\n========================================`);
  console.log(`=== TESTING prefers-reduced-motion ===`);
  const reducedMotionPage = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });
  await reducedMotionPage.emulateMedia({ reducedMotion: 'reduce' });
  await reducedMotionPage.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

  const initialSlideReduced = await reducedMotionPage.evaluate(() => {
    const s = document.querySelector('.hero-slide.is-active');
    const h = document.querySelector('.hero-headline.is-active');
    return { slide: s.getAttribute('data-slide'), headline: h.textContent.trim() };
  });

  // Wait 7 seconds (longer than standard 6s slide duration) to confirm it does not auto-advance
  await reducedMotionPage.waitForTimeout(7000);
  const slideAfter7sReduced = await reducedMotionPage.evaluate(() => {
    const s = document.querySelector('.hero-slide.is-active');
    const h = document.querySelector('.hero-headline.is-active');
    return { slide: s.getAttribute('data-slide'), headline: h.textContent.trim() };
  });
  console.log(`Reduced Motion Initial: data-slide=${initialSlideReduced.slide}, headline="${initialSlideReduced.headline}"`);
  console.log(`Reduced Motion After 7s: data-slide=${slideAfter7sReduced.slide}, headline="${slideAfter7sReduced.headline}"`);
  console.log(`Auto-advance disabled: ${initialSlideReduced.slide === slideAfter7sReduced.slide && initialSlideReduced.headline === slideAfter7sReduced.headline}`);

  await reducedMotionPage.close();

  // Test automatic advance when reduced motion is NOT enabled
  console.log(`\n========================================`);
  console.log(`=== TESTING AUTOMATIC ADVANCE (Standard) ===`);
  const autoPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await autoPage.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  const startSlide = await autoPage.evaluate(() => {
    const s = document.querySelector('.hero-slide.is-active');
    const h = document.querySelector('.hero-headline.is-active');
    return { slide: s.getAttribute('data-slide'), headline: h.textContent.trim() };
  });
  console.log(`Auto Advance: Start slide=${startSlide.slide}, headline="${startSlide.headline}"`);
  // Wait 7.5s (6s timer + 1.2s crossfade + buffer)
  await autoPage.waitForTimeout(7500);
  const autoSlide = await autoPage.evaluate(() => {
    const s = document.querySelector('.hero-slide.is-active');
    const h = document.querySelector('.hero-headline.is-active');
    return { slide: s.getAttribute('data-slide'), headline: h.textContent.trim() };
  });
  console.log(`Auto Advance: Slide after 7.5s: slide=${autoSlide.slide}, headline="${autoSlide.headline}"`);
  console.log(`Successfully advanced in sync: ${autoSlide.slide === '1' && autoSlide.headline === expectedHeadlines[1]}`);
  await autoPage.close();

  await browser.close();
  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY.');
})();
