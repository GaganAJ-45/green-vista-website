# Green Vista — Image Manifest

All expected image filenames are documented here.
Source files go in `/assets/raw/`. Processed outputs go to `/public/images/`.

---

## How to supply a photograph

1. Name the file as shown in the manifest below, or use a configured
   friendly source alias where noted. Supported extensions include
   `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, and `.tiff`.
2. Drop it into `/assets/raw/`
3. Run `npm run images`

The matching optimized asset is automatically regenerated. Replacing an
existing image does not require markup changes; adding a new Gallery item
does require a Gallery entry in `index.html`.

### Configured Gallery source aliases

| Source filename in `/assets/raw/` | Optimized output name |
|---|---|
| `Entrance Planting.png` | `entrance-planting` |
| `Terrace Garden.png` | `gallery-terrace-garden` |
| `Villa Landscaping.png` | `gallery-villa` |
| `Outdoor Living.png` | `gallery-outdoor-living` |
| `Sustainable Planting.png` | `sustainable-planting` |
| `Commercial Landscaping.png` | `gallery-commercial` |
| `Native Planting Detail.png` | `native-planting-detail` |
| `Pergola & Outdoor Structures.png` | `pergola-outdoor` |
| `Pergola Structure.png` | `gallery-pergola` |
| `Stone Pathway.png` | `stone-pathway` |
| `Vertical Green Wall.png` | `vertical-green-wall` |

---

## Expected images

| Name | Used in | Subject / notes |
|---|---|---|
| `hero-villa-garden` | Hero slide 1; Gallery — Hero Villa Garden | Lush tropical garden with palms, stone pathway, pool |
| `hero-modern-villa` | Hero slide 2 | Contemporary villa with swimming pool, greenery, outdoor living |
| `hero-evening-living` | Hero slide 3 | Luxury landscaped garden at blue hour with warm lighting |
| `hero-mobile-1` | Hero slide 1 on mobile | Left panel cropped from `assets/raw/hero-image.png`, excluding white divider |
| `hero-mobile-2` | Hero slide 2 on mobile | Center panel cropped from `assets/raw/hero-image.png`, excluding white dividers |
| `hero-mobile-3` | Hero slide 3 on mobile | Right panel cropped from `assets/raw/hero-image.png`, excluding white divider |
| `villa-garden-whitefield` | Projects — Project 1 | Villa Garden, Whitefield |
| `rooftop-terrace-indiranagar` | Projects — Project 2 | Rooftop Terrace, Indiranagar |
| `office-campus-orr` | Projects — Project 3 | Office Campus, Outer Ring Road |
| `terrace-garden` | Services | Terrace Garden service image |
| `vertical-garden` | Services | Vertical Garden service image |
| `commercial-landscaping` | Services | Commercial Landscaping service image |
| `pergola-structures` | Services | Pergola & Structures service image |
| `before` | Transformation slider | **Before** state — **must show the same garden** as `after` |
| `after` | Transformation slider | **After** state — **must show the same garden** as `before` |
| `sustainable-planting` | Gallery | Caption: Sustainable Planting |
| `entrance-planting` | Gallery | Caption: Entrance Planting |
| `stone-pathway` | Gallery | Caption: Stone Pathway |
| `terrace-deck` | Gallery | Caption: Terrace Deck |
| `vertical-green-wall` | Gallery | Caption: Vertical Green Wall |
| `lawn-seating` | Gallery | Caption: Lawn & Seating |
| `evening-lighting` | Gallery | Caption: Evening Lighting |
| `native-planting-detail` | Gallery | Caption: Native Planting Detail |
| `pergola-outdoor` | Gallery | Caption: Pergola & Outdoor Structures |
| `gallery-terrace-garden` | Gallery | Caption: Terrace Garden |
| `gallery-villa` | Gallery | Caption: Villa Landscaping |
| `gallery-outdoor-living` | Gallery | Caption: Outdoor Living |
| `gallery-commercial` | Gallery | Caption: Commercial Landscaping |
| `gallery-pergola` | Gallery | Caption: Pergola Structure |
| `logo-emblem` | Header | Official logo — replaces wordmark when supplied |

---

## Before-and-after note

> [!WARNING]
> `before` and `after` **must show the same garden** in its unfinished and finished
> states. Do not use unrelated photographs. The transformation slider is a meaningful
> comparison, not a generic before/after effect. If suitable photographs are not yet
> available, the component displays clearly marked placeholders.

---

## Image reuse

Some images serve multiple sections to reduce the photograph count:

| File | Also used as |
|---|---|
| `villa-landscaping` | Hero slide 2 + Villa Landscaping service image |
| `outdoor-living` | Hero slide 3 + Outdoor Living section background |

---

## Responsive output

Each source produces these output files:

| Width | WebP | AVIF |
|---|---|---|
| 640 px | `{name}-640.webp` | `{name}-640.avif` |
| 1024 px | `{name}-1024.webp` | `{name}-1024.avif` |
| 1600 px | `{name}-1600.webp` | `{name}-1600.avif` |

The three narrow mobile hero crops are emitted once at their native widths
(452 px, 452 px, and 453 px) to avoid redundant copies and prevent upscaling.

---

## srcset pattern (reference — used in later phases)

```html
<!-- Standard image with WebP srcset -->
<img
  src="/images/{name}-1600.webp"
  srcset="/images/{name}-640.webp 640w,
          /images/{name}-1024.webp 1024w,
          /images/{name}-1600.webp 1600w"
  sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1600px"
  alt="[descriptive alt text]"
  width="1600"
  height="900"
  loading="lazy"
/>
```

```html
<!-- With AVIF fallback (preferred for maximum compression) -->
<picture>
  <source
    type="image/avif"
    srcset="/images/{name}-640.avif 640w,
            /images/{name}-1024.avif 1024w,
            /images/{name}-1600.avif 1600w"
    sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1600px"
  />
  <img
    src="/images/{name}-1600.webp"
    srcset="/images/{name}-640.webp 640w,
            /images/{name}-1024.webp 1024w,
            /images/{name}-1600.webp 1600w"
    sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1600px"
    alt="[descriptive alt text]"
    width="1600"
    height="900"
    loading="lazy"
  />
</picture>
```

For the **first hero slide**, use `fetchpriority="high"` and omit `loading="lazy"`.
