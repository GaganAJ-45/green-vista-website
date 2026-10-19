/**
 * optimize-images.mjs — Image optimisation script
 * Green Vista
 *
 * Usage:
 *   node scripts/optimize-images.mjs
 *   (or: npm run images)
 *   npm run images -- --only gallery-commercial,native-planting-detail
 *
 * What it does:
 *   For each image name in IMAGE_MANIFEST:
 *     - If a source file exists in /assets/raw/ (any common extension),
 *       it converts the photo to WebP (and optionally AVIF) at responsive widths.
 *     - If the source file is MISSING, it generates a clearly labelled gradient
 *       placeholder so the layout can be built and reviewed during development.
 *
 * To replace a placeholder with a real photograph:
 *   1. Drop the file into /assets/raw/ using its IMAGE_MANIFEST name, or a
 *      configured friendly source alias (e.g. Entrance Planting.png)
 *      (supported extensions: jpg, jpeg, png, webp, avif, tiff)
 *   2. Run `npm run images`
 *   3. No HTML or CSS changes are required.
 *
 * Output naming:  public/images/{name}-{width}.webp
 *                 public/images/{name}-{width}.avif  (if GENERATE_AVIF = true)
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const RAW_DIR   = path.join(ROOT, 'assets', 'raw');
const OUT_DIR   = path.join(ROOT, 'public', 'images');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Source file extensions to look for (checked in this order). */
const SOURCE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff'];

/** Friendly source filenames supplied with spaces instead of manifest slugs. */
const SOURCE_ALIASES = {
  'entrance-planting': 'Entrance Planting',
  'gallery-terrace-garden': 'Terrace Garden',
  'gallery-villa': 'Villa Landscaping',
  'gallery-outdoor-living': 'Outdoor Living',
  'sustainable-planting': 'Sustainable Planting',
  'gallery-commercial': 'Commercial Landscaping',
  'native-planting-detail': 'Native Planting Detail',
  'pergola-outdoor': 'Pergola & Outdoor Structures',
  'gallery-pergola': 'Pergola Structure',
  'stone-pathway': 'Stone Pathway',
  'vertical-green-wall': 'Vertical Green Wall',
  'lawn-seating': 'Lawn & Seating',
};

/** Output widths in pixels. Srcset covers 640 / 1024 / 1600. */
const OUTPUT_WIDTHS = [640, 1024, 1600];

/** Narrow mobile hero crops stay at their native width to avoid duplicate upscale aliases. */
const NATIVE_WIDTH_OUTPUTS = new Set(['hero-mobile-1', 'hero-mobile-2', 'hero-mobile-3']);

/** WebP quality. Target: ~150–250 KB at 1600 px for landscape photos. */
const WEBP_QUALITY = 78;

/** AVIF quality (higher compression, smaller files). */
const AVIF_QUALITY = 68;

/** Set to true to also generate AVIF variants (slower build). */
const GENERATE_AVIF = true;

/** Aspect ratio used when a source file is missing (16:9 landscape). */
const PLACEHOLDER_ASPECT = { width: 1600, height: 900 };

// Brand colours for gradient placeholders
const GRADIENT_START = '#18281f'; // --forest
const GRADIENT_END   = '#3a5c42'; // mid-green
const GRADIENT_MID   = '#6c7552'; // --olive
const TEXT_COLOUR    = '#efe4cb'; // --sand-lt

// ---------------------------------------------------------------------------
// IMAGE_MANIFEST
// The single source of truth for all expected image names.
// The HTML/CSS always references /images/{name}-{width}.webp.
// ---------------------------------------------------------------------------

export const IMAGE_MANIFEST = [
  // --- Hero crossfade slides (Phase 1) ---
  'hero-villa-garden',            // Slide 1: lush tropical garden with palms, stone pathway, pool
  'hero-modern-villa',            // Slide 2: contemporary villa with pool, greenery, outdoor living
  'hero-evening-living',          // Slide 3: luxury landscaped garden at blue hour with warm lighting
  'hero-mobile-1',                // Slide 1 mobile crop from hero-image.png
  'hero-mobile-2',                // Slide 2 mobile crop from hero-image.png
  'hero-mobile-3',                // Slide 3 mobile crop from hero-image.png

  // --- Projects (Phase 2) ---
  'villa-garden-whitefield',      // Project 1: Villa Garden, Whitefield
  'rooftop-terrace-indiranagar',  // Project 2: Rooftop Terrace, Indiranagar
  'office-campus-orr',            // Project 3: Office Campus, Outer Ring Road

  // --- Services (Phase 3) ---
  // Note: villa-landscaping (hero slide 2) can also serve the villa service context
  'terrace-garden',               // Service: Terrace Garden
  'vertical-garden',              // Service: Vertical Garden
  'commercial-landscaping',       // Service: Commercial Landscaping
  'pergola-structures',           // Service: Pergola & Structures

  // --- Transformation slider (Phase 4) ---
  // IMPORTANT: before + after MUST show the same garden in unfinished and finished states.
  // Do not use unrelated photographs for this section.
  'before',                       // Before: same garden, unlandscaped
  'after',                        // After:  same garden, finished landscape

  // --- Feature sections (Phases 6) ---
  'sustainable-planting',         // Sustainability section (climate-aware design)
  // Outdoor Living reuses 'outdoor-living' (hero slide 3) — no separate file needed

  // --- Gallery — 13 dedicated image outputs (Phase 7) ---
  'entrance-planting',            // Caption: Entrance Planting
  'stone-pathway',                // Caption: Stone Pathway
  'terrace-deck',                 // Caption: Terrace Deck
  'vertical-green-wall',          // Caption: Vertical Green Wall
  'lawn-seating',                 // Caption: Lawn & Seating
  'evening-lighting',             // Caption: Evening Lighting
  'native-planting-detail',       // Caption: Native Planting Detail
  'pergola-outdoor',              // Caption: Pergola & Outdoor Structures
  'gallery-terrace-garden',       // Caption: Terrace Garden
  'gallery-villa',                // Caption: Villa Landscaping
  'gallery-outdoor-living',       // Caption: Outdoor Living
  // sustainable-planting is also used by the Gallery as Sustainable Planting
  'gallery-commercial',           // Caption: Commercial Landscaping
  'gallery-pergola',              // Caption: Pergola Structure

  // --- Brand (all phases) ---
  'logo-emblem',                  // Official logo — replaces typographic wordmark when supplied
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/** Restrict a pipeline run to named manifest entries when --only is supplied. */
function getManifestForRun() {
  const onlyIndex = process.argv.indexOf('--only');
  if (onlyIndex === -1) return IMAGE_MANIFEST;

  const requested = (process.argv[onlyIndex + 1] || '').split(',').filter(Boolean);
  if (requested.length === 0) throw new Error('Pass one or more image names after --only.');

  const unknown = requested.filter(name => !IMAGE_MANIFEST.includes(name));
  if (unknown.length) throw new Error(`Unknown image name(s): ${unknown.join(', ')}`);

  return IMAGE_MANIFEST.filter(name => requested.includes(name));
}

/**
 * Look for the source file in /assets/raw/ with any supported extension.
 * Returns the full path if found, or null if not found.
 */
async function findSource(name) {
  const sourceNames = [name, SOURCE_ALIASES[name]].filter(Boolean);
  for (const sourceName of sourceNames) {
    for (const ext of SOURCE_EXTS) {
      const candidate = path.join(RAW_DIR, sourceName + ext);
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // Not this extension — try the next
      }
    }
  }
  return null;
}

/**
 * Generate an SVG gradient placeholder with the image name as visible text.
 * Returns a Buffer suitable for passing to sharp().
 */
function buildPlaceholderSvg(name, width, height) {
  const baseFontSize   = Math.max(16, Math.round(width / 24));
  const labelFontSize  = Math.max(11, Math.round(width / 56));
  const labelY         = Math.round(height / 2 + baseFontSize * 0.8);
  const nameY          = Math.round(height / 2 - baseFontSize * 0.2);

  // Diagonal cross-lines to visually mark this as a placeholder
  const crossOpacity = '0.07';

  return Buffer.from(`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${GRADIENT_START}" />
      <stop offset="60%"  stop-color="${GRADIENT_END}" />
      <stop offset="100%" stop-color="${GRADIENT_MID}" />
    </linearGradient>
  </defs>

  <!-- Background gradient -->
  <rect width="${width}" height="${height}" fill="url(#bg)" />

  <!-- Diagonal placeholder cross -->
  <line x1="0" y1="0" x2="${width}" y2="${height}"
    stroke="white" stroke-width="1" opacity="${crossOpacity}" />
  <line x1="${width}" y1="0" x2="0" y2="${height}"
    stroke="white" stroke-width="1" opacity="${crossOpacity}" />

  <!-- Image name -->
  <text
    x="${width / 2}"
    y="${nameY}"
    font-family="Georgia, serif"
    font-size="${baseFontSize}"
    font-weight="400"
    fill="${TEXT_COLOUR}"
    text-anchor="middle"
    dominant-baseline="middle"
    opacity="0.9"
  >${name}</text>

  <!-- Placeholder label -->
  <text
    x="${width / 2}"
    y="${labelY}"
    font-family="Georgia, serif"
    font-size="${labelFontSize}"
    fill="${TEXT_COLOUR}"
    text-anchor="middle"
    dominant-baseline="middle"
    opacity="0.4"
  >Image placeholder — replace with real photograph</text>
</svg>`);
}

/**
 * Process a real source image into WebP (+ AVIF) at all output widths.
 */
async function processRealImage(name, sourcePath) {
  const results = [];
  const sourceMetadata = await sharp(sourcePath).metadata();
  const outputWidths = NATIVE_WIDTH_OUTPUTS.has(name)
    ? [sourceMetadata.width]
    : OUTPUT_WIDTHS;

  for (const targetWidth of outputWidths) {
    // WebP
    const webpPath = path.join(OUT_DIR, `${name}-${targetWidth}.webp`);
    const webpInfo = await sharp(sourcePath)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    const webpStat = await fs.stat(webpPath);
    results.push({
      file: `${name}-${targetWidth}.webp`,
      size: `${Math.round(webpStat.size / 1024)} KB`,
    });

    // AVIF (optional)
    if (GENERATE_AVIF) {
      const avifPath = path.join(OUT_DIR, `${name}-${targetWidth}.avif`);
      await sharp(sourcePath)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .avif({ quality: AVIF_QUALITY })
        .toFile(avifPath);

      const avifStat = await fs.stat(avifPath);
      results.push({
        file: `${name}-${targetWidth}.avif`,
        size: `${Math.round(avifStat.size / 1024)} KB`,
      });
    }
  }

  return results;
}

/**
 * Generate placeholder WebP (+ AVIF) images at all output widths.
 */
async function processMissingImage(name) {
  const { width: pw, height: ph } = PLACEHOLDER_ASPECT;
  const results = [];

  for (const targetWidth of OUTPUT_WIDTHS) {
    const targetHeight = Math.round((ph / pw) * targetWidth);
    const svgBuffer    = buildPlaceholderSvg(name, targetWidth, targetHeight);

    // WebP placeholder
    const webpPath = path.join(OUT_DIR, `${name}-${targetWidth}.webp`);
    await sharp(svgBuffer)
      .resize(targetWidth, targetHeight)
      .webp({ quality: 80 })
      .toFile(webpPath);
    results.push({ file: `${name}-${targetWidth}.webp`, placeholder: true });

    // AVIF placeholder (optional)
    if (GENERATE_AVIF) {
      const avifPath = path.join(OUT_DIR, `${name}-${targetWidth}.avif`);
      await sharp(svgBuffer)
        .resize(targetWidth, targetHeight)
        .avif({ quality: 70 })
        .toFile(avifPath);
      results.push({ file: `${name}-${targetWidth}.avif`, placeholder: true });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const manifestForRun = getManifestForRun();
  console.log('\n🌿 Green Vista — Image Optimisation');
  console.log('─────────────────────────────────────────────');
  console.log(`  Source:  ${RAW_DIR}`);
  console.log(`  Output:  ${OUT_DIR}`);
  console.log(`  Widths:  ${OUTPUT_WIDTHS.join(', ')} px`);
  console.log(`  Images:  ${manifestForRun.length === IMAGE_MANIFEST.length ? 'full manifest' : manifestForRun.join(', ')}`);
  console.log(`  WebP quality: ${WEBP_QUALITY}  |  AVIF: ${GENERATE_AVIF ? AVIF_QUALITY : 'off'}`);
  console.log('─────────────────────────────────────────────\n');

  await ensureDir(RAW_DIR);
  await ensureDir(OUT_DIR);

  const processed    = [];
  const placeholders = [];
  const errors       = [];

  for (const name of manifestForRun) {
    const pad        = 42;
    const sourcePath = await findSource(name);

    process.stdout.write(`  ${name.padEnd(pad)}`);

    try {
      if (sourcePath) {
        const results = await processRealImage(name, sourcePath);
        const sizes   = results.filter(r => r.size).map(r => r.size).join(' / ');
        console.log(`✓  ${sizes}`);
        processed.push(name);
      } else {
        await processMissingImage(name);
        console.log('▫  placeholder (source not in /assets/raw/)');
        placeholders.push(name);
      }
    } catch (err) {
      console.log(`✕  ERROR: ${err.message}`);
      errors.push({ name, error: err.message });
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log(`  ✓ Optimised from source:   ${processed.length}`);
  console.log(`  ▫ Placeholders generated:  ${placeholders.length}`);
  if (errors.length) {
    console.log(`  ✕ Errors:                  ${errors.length}`);
    errors.forEach(e => console.log(`    - ${e.name}: ${e.error}`));
  }

  if (placeholders.length > 0) {
    console.log('\n  To replace a placeholder:');
    console.log('    1. Drop the photo into /assets/raw/ (jpg / jpeg / png / webp)');
    console.log('    2. Run `npm run images`');
    console.log('    3. No HTML or CSS changes needed.\n');
  } else {
    console.log('');
  }
}

main().catch((err) => {
  console.error('\n✕ Fatal error:', err.message);
  process.exit(1);
});
