/**
 * main.js — Green Vista entry point
 *
 * Import order:
 *   1. Self-hosted fonts (@fontsource packages)
 *   2. Design tokens
 *   3. Base / reset
 *   4. Section styles (one per section — added as sections are built)
 *   5. Section JS modules (initialised when DOM is ready)
 */

// ---------------------------------------------------------------------------
// 1. Fonts — self-hosted via @fontsource
// ---------------------------------------------------------------------------

// Cormorant Garamond: headings, editorial titles, quotations
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css'; // testimonial quotes

// Inter: body text, navigation, buttons, forms
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

// ---------------------------------------------------------------------------
// 2. Design tokens
// ---------------------------------------------------------------------------

import './styles/tokens.css';

// ---------------------------------------------------------------------------
// 3. Base / reset
// ---------------------------------------------------------------------------

import './styles/base.css';

// ---------------------------------------------------------------------------
// 4. Section styles
// Phase 0: header + footer only.
// Additional imports are added here as each section is built.
// ---------------------------------------------------------------------------

import './styles/header.css';
import './styles/hero.css';
import './styles/intro.css';
import './styles/projects.css';
import './styles/transformation.css';
import './styles/process.css';
import './styles/footer.css';

import './styles/gallery.css';
import './styles/testimonials.css';
import './styles/contact.css';
import './styles/whatsapp.css';
import './styles/reveal.css';
// Phase 8:  import './styles/cta.css';
//           import './styles/contact.css';

// ---------------------------------------------------------------------------
// 5. Section JS modules
// ---------------------------------------------------------------------------

import { initNav } from './sections/nav.js';
import { initHero } from './sections/hero.js';
import { initTransformation } from './sections/transformation.js';

// Phase 4:  import { initTransformation } from './sections/transformation.js';
import { initGallery } from './sections/gallery.js';
import { initContact } from './sections/contact.js';
import { initFooter } from './sections/footer.js';
import { initTestimonials } from './sections/testimonials.js';
import { initReveal } from './sections/reveal.js';
// Phase 8:  import { initContact }        from './sections/contact.js';

// ---------------------------------------------------------------------------
// Initialise on DOM ready
// ---------------------------------------------------------------------------

function init() {
  initNav();
  initHero();
  initTransformation();
  initGallery();
  initContact();
  initFooter();
  initTestimonials();
  initReveal();

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already parsed (e.g., script deferred)
  init();
}
