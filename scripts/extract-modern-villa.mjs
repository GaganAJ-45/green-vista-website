import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const avifData = fs.readFileSync('assets/raw/hero-modern-villa.avif');
  const base64 = avifData.toString('base64');
  
  await page.setContent(`<!DOCTYPE html>
<html>
<head><style>html, body { margin: 0; padding: 0; overflow: hidden; }</style></head>
<body>
  <img id="img" src="data:image/avif;base64,${base64}" />
</body>
</html>`);

  await page.waitForSelector('#img');
  const img = await page.$('#img');
  const naturalDimensions = await page.evaluate(() => {
    const el = document.getElementById('img');
    return { naturalWidth: el.naturalWidth, naturalHeight: el.naturalHeight };
  });
  console.log('Natural dimensions:', naturalDimensions);

  await page.setViewportSize({ width: naturalDimensions.naturalWidth, height: naturalDimensions.naturalHeight });
  const pngBuffer = await img.screenshot();
  fs.writeFileSync('assets/raw/hero-modern-villa.png', pngBuffer);
  console.log('Successfully saved hero-modern-villa.png! Size:', pngBuffer.length);

  await browser.close();
})();
