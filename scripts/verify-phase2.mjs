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

    // Verify Introduction Section content
    const introData = await page.evaluate(() => {
      const section = document.querySelector('.intro-section');
      const heading = section ? section.querySelector('.intro-heading').textContent.trim() : null;
      const lead = section ? section.querySelector('.intro-lead').textContent.trim() : null;
      const strengths = section ? Array.from(section.querySelectorAll('.intro-strength-item')).map(el => ({
        title: el.querySelector('.intro-strength-title').textContent.trim(),
        desc: el.querySelector('.intro-strength-desc').textContent.trim()
      })) : [];
      return { heading, leadLength: lead ? lead.length : 0, strengthCount: strengths.length, strengths };
    });
    console.log(`Introduction Verification:
  Heading: "${introData.heading}"
  Lead paragraph length: ${introData.leadLength} chars
  Strengths Count: ${introData.strengthCount}`);

    // Verify Selected Projects Section content
    const projectsData = await page.evaluate(() => {
      const section = document.querySelector('.projects-section');
      const title = section ? section.querySelector('.projects-title').textContent.trim() : null;
      const items = section ? Array.from(section.querySelectorAll('.project-item')).map(item => ({
        name: item.querySelector('.project-name').textContent.trim(),
        heading: item.querySelector('.project-heading').textContent.trim(),
        category: item.querySelector('.project-category').textContent.trim(),
        hasImage: !!item.querySelector('.project-img'),
        imageSrc: item.querySelector('.project-img') ? item.querySelector('.project-img').getAttribute('src') : null
      })) : [];
      return { title, projectCount: items.length, items };
    });
    console.log(`Selected Projects Verification:
  Section Title: "${projectsData.title}"
  Project Count: ${projectsData.projectCount}`);
    projectsData.items.forEach((p, idx) => {
      console.log(`  Project ${idx + 1}: ${p.name} | Category: ${p.category} | Image: ${p.imageSrc}`);
    });

    // Check Hero is untouched and working
    const heroActive = await page.evaluate(() => {
      const slide = document.querySelector('.hero-slide.is-active');
      const headline = document.querySelector('.hero-headline.is-active');
      return {
        slideIdx: slide ? slide.getAttribute('data-slide') : null,
        headline: headline ? headline.textContent.trim() : null
      };
    });
    console.log(`Hero state check: Slide ${heroActive.slideIdx} active ("${heroActive.headline}")`);

    // Temporarily hide fixed header so it doesn't overlay section screenshots
    await page.evaluate(() => {
      const h = document.getElementById('site-header');
      if (h) h.style.visibility = 'hidden';
    });

    // Screenshot of Intro Section
    const introEl = await page.$('.intro-section');
    if (introEl) {
      await introEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const shotIntro = path.join(screenshotDir, `intro-${label.toLowerCase()}.png`);
      await introEl.screenshot({ path: shotIntro });
      console.log(`Saved screenshot: ${shotIntro}`);
    }

    // Screenshot of Projects Section
    const projectsEl = await page.$('.projects-section');
    if (projectsEl) {
      await projectsEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const shotProjects = path.join(screenshotDir, `projects-${label.toLowerCase()}.png`);
      await projectsEl.screenshot({ path: shotProjects });
      console.log(`Saved screenshot: ${shotProjects}`);
    }

    // Restore fixed header visibility
    await page.evaluate(() => {
      const h = document.getElementById('site-header');
      if (h) h.style.visibility = '';
    });

    await page.close();
  };

  // Test standard Desktop 1440x900
  await testViewport(1440, 900, 'DESKTOP');

  // Test Mobile 390x844
  await testViewport(390, 844, 'MOBILE');

  // Test Tablet 768x1024
  await testViewport(768, 1024, 'TABLET');

  await browser.close();
  console.log('\nALL PHASE 2 VERIFICATION TESTS COMPLETED SUCCESSFULLY.');
})();
