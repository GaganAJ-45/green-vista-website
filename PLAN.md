# Green Vista: Website Build Plan

Read this file and `CONTENT.md` fully before doing anything.
They are the single source of truth. Do not start building until I paste a section prompt.

---

## 1. Project

Build a new website for **Green Vista**, a landscape design studio in Bangalore,
from scratch, one section at a time.

- Brand: Green Vista  
- Tagline: *Farming Luxury, Crafting Landscapes*  
- Location: Bangalore, India  
- Primary objective: Convert visitors into consultation inquiries  
- Audience: homeowners (villas, terraces) and businesses (office campuses, hospitality)

**This is a static, photography-led website.**

There is no 3D scene. There is no Three.js, WebGL, depth-parallax, particle system,
or scroll-driven 3D transformation anywhere in this project — not now, not as a future
optional enhancement. Do not introduce them.

---

## 2. How you must work

1. **One section per prompt.** Build only the section I ask for.
2. **Plan first.** Write a short plan (files, approach, risks) before coding.
3. **Verify before reporting.** Run the build. Inspect at 1440 px desktop and 390 px mobile.
   Fix problems before reporting done.
4. **Do not commit or push between sections.**
5. **Report format** at the end of every section:
   - What you built (3–5 lines)
   - Files changed
   - Anything assumed or impossible
   - What I should look at first
6. **Ask me** when something is missing. One focused question at a time.
7. **Never invent content.** All text comes from `CONTENT.md`. Flag missing copy.

---

## 3. Inputs

| File | Purpose |
|---|---|
| `PLAN.md` | This file — technical and design specification |
| `CONTENT.md` | Every word on the site. Use it exactly as written. |
| `/assets/raw/` | Original photographs (input only, not shipped) |

**If an image file is missing from `/assets/raw/`**, render a tinted gradient placeholder
(`--forest` to `--olive`) with the expected filename as visible text.
Swapping in a real image later must require only dropping the file in the folder and
re-running the image script. No code changes required.

---

## 4. Technology stack

| Concern | Choice |
|---|---|
| Build tool | Vite (vanilla JS, no framework) |
| HTML | Semantic HTML5 |
| CSS | Vanilla CSS with custom properties |
| JS | Lightweight vanilla JS |
| Image optimisation | Sharp via `scripts/optimize-images.mjs` |
| Fonts | `@fontsource/cormorant-garamond` and `@fontsource/inter` (self-hosted) |
| Deployment | Netlify |

Do not install GSAP, ScrollTrigger, Lenis, Three.js, or any animation library.
CSS transitions and small JS functions handle all interactions.
Native browser scrolling is preserved throughout.

---

## 5. Project file structure

```
/assets/raw/          Original photos (input only — never shipped)
/scripts/
  optimize-images.mjs Sharp: raw → public/images as WebP (+AVIF where practical)
/public/
  images/             Generated responsive image files
  fonts/              If needed alongside @fontsource
/src/
  styles/
    tokens.css        CSS custom properties (colors, type scale, spacing)
    base.css          Reset, global elements
    header.css
    hero.css
    intro.css
    projects.css
    services.css
    transformation.css
    process.css
    outdoor.css
    sustainability.css
    why.css
    gallery.css
    testimonials.css
    cta.css
    contact.css
    footer.css
  sections/
    hero.js           Crossfade slideshow logic
    services.js       Hover/tap service image swap
    transformation.js Before-and-after drag slider
    gallery.js        Masonry layout + accessible lightbox
    testimonials.js   Optional static/minimal carousel
    contact.js        Form validation and submission
    nav.js            Scroll header + mobile menu
  main.js             Imports all section modules
index.html
PLAN.md
CONTENT.md
```

---

## 6. Design system

### 6.1 Brand colors

Define all as CSS custom properties on `:root`.

| Token | Hex | Primary use |
|---|---|---|
| `--forest-deep` | `#0e1712` | Darkest backgrounds, header after scroll, footer |
| `--forest` | `#18281f` | Dark sections, body text on light |
| `--olive` | `#6c7552` | Secondary accents |
| `--sand` | `#d7c3a2` | Warm neutrals, testimonials |
| `--sand-lt` | `#efe4cb` | Light warm surfaces |
| `--gold` | `#a9854c` | Restrained accents |
| `--gold-lt` | `#c9a76a` | Primary CTA buttons on dark backgrounds |
| `--off` | `#f6f1e7` | Light section backgrounds, text on dark |
| `--char` | `#211d18` | Body text on light |
| `--dusk` | `#14202b` | Dark overlay tone used in hero gradient |
| `--moss` | `#2f4a36` | Sustainability section background |
| `--mist` | `#dfe6dc` | Pale sage — services section background |

Check every foreground/background combination for WCAG AA.
Gold text on any background requires particular attention.

### 6.2 Typography

- Headlines and editorial titles: **Cormorant Garamond** (weights 500, 600)
- Body text, UI, navigation, forms: **Inter** (weights 400, 500)
- Install via `@fontsource` packages (Latin subset only, self-hosted)
- Fluid type sizing with `clamp()`:

| Role | Desktop | Mobile |
|---|---|---|
| Hero headline | 64–88 px | 42–54 px |
| Section headings | 42–60 px | 32–42 px |
| Project titles | 28–40 px | 26–32 px |
| Body text | 16–18 px | 15–17 px |

Body line length: under 70 characters.
Adjust values where the actual layout demands it.

### 6.3 Section color rhythm

No two adjacent sections share a background.

| Section | Background | Foreground mood |
|---|---|---|
| Header | Transparent → `--forest-deep` (on scroll) | `--off`, `--gold-lt` |
| Hero | Photograph + dark overlay | `--off`, `--gold-lt` buttons |
| Intro + Projects | `--off` | `--forest` text |
| Services | `--mist` | `--forest`, `--olive` details |
| Transformation | `--sand-lt` | `--forest` |
| Process | `--forest-deep` | `--off`, `--gold-lt` markers |
| Outdoor Living | Full-bleed photograph | `--off` |
| Sustainability | `--moss` | `--off`, `--sand` |
| Why Green Vista | `--off` | `--forest` |
| Gallery | `--forest` | Photos on dark |
| Testimonials | `--sand` | `--forest` |
| Closing CTA | `--forest` | `--off`, `--gold-lt` button |
| Contact | `--off` | `--forest` |
| Footer | `--forest-deep` | `--off`, `--sand` |

---

## 7. Hero section — three-photograph automatic crossfade

The hero is the most important visual element on the site.
It uses three full-bleed garden photographs that change automatically
with smooth crossfade transitions.

**There is no 3D animation.** No depth map. No camera movement. No parallax.

### 7.1 The three photographs

| Slot | Filename | Subject |
|---|---|---|
| Slide 1 | `hero-evening-living` | Premium villa garden with warm architectural lighting |
| Slide 2 | `villa-landscaping` | Modern rooftop or terrace garden with pergola and seating |
| Slide 3 | `outdoor-living` | Lush landscaped garden with stone pathway and layered planting |

If a file is missing, render a clearly labeled gradient placeholder.
The manifest above is the canonical source; re-running the image script
after adding the file is the only step required to replace a placeholder.

### 7.2 Hero layout

- Full-width, 100 svh minimum height (practical mobile), 90 vh on desktop
- `background-size: cover`, carefully chosen `background-position` per image
- Subtle dark overlay (`--dusk` at ~55% opacity)
- Gradient from transparent to `--forest-deep` rising behind the text block
- Headline, paragraph, and CTAs remain stationary during slide changes
- Slide indicators appear at the bottom of the hero

### 7.3 Hero content (from CONTENT.md — do not modify)

```
Small line:  Landscape Design Studio - Bangalore
Headline:    We design landscapes that feel like home.
Subtext:     Bespoke landscape design, garden development and outdoor spaces
             crafted around the way you live, for villas, homes and businesses
             across Bangalore.
Primary CTA: Explore Our Work
Secondary:   Book a Consultation
Highlights:  Villa gardens · Terrace design · Outdoor living · Commercial landscapes
```

### 7.4 Crossfade behavior

1. Display the first photograph immediately on load (high-priority fetch)
2. Auto-transition every ~6 seconds
3. Loop: 1 → 2 → 3 → 1
4. Crossfade duration: ~1.2 seconds, CSS `opacity` transition only
5. No horizontal sliding. No zoom. No parallax.
6. Text does not animate on slide changes
7. Three dot indicators at the bottom, keyboard accessible, labeled with `aria-label`
8. Clicking an indicator jumps to that slide
9. Page Visibility API: suspend slideshow timer when tab is hidden
10. `prefers-reduced-motion`: show one static photograph, disable auto-advance

### 7.5 Image loading

- Slide 1: `fetchpriority="high"`, no lazy loading
- Slides 2 and 3: preloaded via `<link rel="preload">` or JS preload
  after the first slide is displayed, so the first transition never shows a blank
- Use `srcset` and `sizes` for responsive delivery
- `width` and `height` attributes on all `<img>` elements to prevent layout shift

### 7.6 Hero quality checklist (verify before marking done)

- [ ] Text readable on all three photographs (check contrast)
- [ ] Navigation visible and functional during slideshow
- [ ] CTAs visible on all three images
- [ ] Headline wraps cleanly at 390 px
- [ ] Indicators visible and respond to keyboard and mouse
- [ ] Crossfade is smooth (no flash, no blank frame, no layout shift)
- [ ] First image loads with high priority
- [ ] Subsequent images preloaded without blocking
- [ ] Reduced-motion shows single static image

---

## 8. Header and navigation

- Logo left, navigation center, CTA right
- Navigation links: Projects | Services | About | Process | Gallery | Contact
- Header CTA: **Get a Consultation**
- Initial state: fully transparent, overlapping the hero
- After scroll (>80 px): transition to solid `--forest-deep` background, slight blur
- Mobile: hamburger icon, accessible off-canvas or overlay menu
- Keyboard accessible, visible focus indicators, correct anchor links
- No horizontal overflow

---

## 9. Image manifest

Expected filenames in `/assets/raw/` (PNG, JPG, or WebP accepted):

```
hero-evening-living
villa-landscaping
outdoor-living
villa-garden-whitefield
rooftop-terrace-indiranagar
office-campus-orr
terrace-garden
vertical-garden
commercial-landscaping
pergola-structures
before
after
sustainable-planting
entrance-planting
stone-pathway
terrace-deck
vertical-green-wall
lawn-seating
evening-lighting
native-planting-detail
pergola-structure
logo-emblem
```

### Image optimisation rules (`scripts/optimize-images.mjs`)

- Output formats: WebP (required), AVIF (where practical)
- Output widths: 640, 1024, 1600 px
- Quality target: approximately 78
- File size target: ~150–250 KB for the 1600 px version (a target, not a constraint
  that degrades quality)
- Preserve aspect ratios, do not upscale
- Descriptive output filenames, no spaces
- Every `<img>` receives: `width`, `height`, `srcset`, `sizes`, `alt`, and
  `loading="lazy"` — except first-screen elements which receive `fetchpriority="high"`

---

## 10. Section-by-section build order

Each phase ends with a runnable, deployable site.

| Phase | Sections | Done when |
|---|---|---|
| **0 — Foundation** | Vite setup, design tokens, fonts, image script, header + mobile nav, footer shell | Builds cleanly, header works on mobile, no layout shift |
| **1 — Hero** | Three-photo crossfade, headline, CTAs, highlight pills, indicators | All quality checklist items pass, smooth on mobile |
| **2 — Intro + Projects** | Introduction statement, four strengths, three project showcases | Varied layout, fast image loading |
| **3 — Services** | Five services list, photo swap on hover/tap | Accessible, works without JS |
| **4 — Transformation** | Before-and-after drag slider | Works with mouse, touch and keyboard; ARIA correct |
| **5 — Process** | Six-step timeline, deep background, gold accents | Horizontal on desktop, vertical on mobile |
| **6 — Outdoor Living + Sustainability** | Two editorial feature sections | Strong photography, clear CTAs |
| **7 — Why Green Vista + Gallery + Testimonials** | Four reasons, 12-photo masonry gallery + lightbox, three testimonials | Lightbox keyboard-accessible, gallery not a uniform grid |
| **8 — CTA + Contact + Footer** | Closing CTA, Netlify Forms contact, footer with map, floating buttons | Form validates, success/error states clear |
| **9 — Polish** | Performance, accessibility, SEO, structured data, responsive testing | Lighthouse 90+ all four categories |

---

## 11. Accessibility requirements

- Semantic HTML5 throughout
- Single `<h1>` per page, correct heading hierarchy
- Skip-to-content link
- All interactive elements keyboard accessible
- Visible focus indicators (not hidden by `outline: none`)
- Accessible form labels, helpful error messages, loading/success/failure states
- Meaningful `alt` text on all images
- ARIA attributes where HTML semantics alone are insufficient
- `prefers-reduced-motion` respected everywhere
- WCAG AA contrast on all text/background pairs
- Accessible slideshow (indicators labeled, keyboard navigable)
- Accessible lightbox (focus managed, Escape closes, trap focus while open)
- Accessible before-and-after slider (keyboard control, ARIA)

---

## 12. Performance requirements

- Target: Lighthouse 90+ on Performance, Accessibility, Best Practices, SEO
- No animation libraries, no WebGL, no 3D renderer
- Minimal JavaScript — CSS does as much as possible
- Optimised WebP images with responsive `srcset`
- Lazy-load all below-fold images
- No layout shifts (set explicit `width`/`height` on images)
- No horizontal overflow
- Efficient event listeners (passive where appropriate)
- No console errors
- No unnecessary third-party scripts
- Embedded map loaded only when visible (Intersection Observer or click-to-load)
- Floating WhatsApp/phone buttons must not obscure form inputs on mobile
- Test on throttled mobile network simulation

---

## 13. SEO metadata

Page title: `Green Vista - Landscape Design Studio, Bangalore`  
Meta description: `Bespoke landscape design, garden development and outdoor living spaces crafted for modern Bangalore homes and businesses.`

Include:
- Appropriate `<meta>` tags
- Open Graph tags
- Canonical URL (add when production domain is confirmed)
- `sitemap.xml`
- `robots.txt`
- `LocalBusiness` JSON-LD structured data (use only verified information)
- Descriptive image `alt` text

Do not invent a production domain or social media URLs.

---

## 14. Unresolved decisions (document and ask before acting)

1. **Photographs** — `/assets/raw/` is currently empty. All hero and section images
   are missing. Gradient placeholders will be used until real photographs are provided.
2. **Logo** — `logo-emblem` is not in `/assets/raw/`. A text-based brand treatment
   (`Green Vista`) will be used until a logo asset is supplied.
3. **Social media URLs** — Instagram and Facebook URLs not yet available.
   Use `href="#"` with `<!-- TODO: replace with real URL -->` comments.
4. **Production domain** — Not yet confirmed. Canonical URL will be added later.
5. **Netlify file uploads** — The contact form includes an optional photo upload field.
   Netlify Forms does not support file uploads natively without a paid service.
   Confirm the approach before implementing that field.
6. **Before/after photographs** — `before` and `after` are missing.
   Confirm whether they show the same garden for a meaningful comparison.

---

## 15. First thing to do

Wait for the first section prompt. Do not start building until then.
