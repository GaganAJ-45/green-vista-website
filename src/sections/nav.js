/**
 * nav.js — Header scroll behaviour and mobile navigation
 * Green Vista
 *
 * Responsibilities:
 *   1. Add .is-scrolled to the header when scrollY > SCROLL_THRESHOLD
 *   2. Toggle the mobile nav open/closed via .nav-open on the header
 *   3. Manage aria-expanded on the toggle button
 *   4. Close the nav on: link click, Escape key, outside click
 *   5. Restore body scroll when nav closes
 */

const SCROLL_THRESHOLD = 80; // px before header background appears

export function initNav() {
  const header = /** @type {HTMLElement | null} */ (document.getElementById('site-header'));
  const toggle = /** @type {HTMLButtonElement | null} */ (document.getElementById('nav-toggle'));
  const nav    = /** @type {HTMLElement | null} */ (document.getElementById('main-nav'));

  if (!header || !toggle || !nav) {
    // Elements not found — silently skip (could be a page without a nav)
    return;
  }

  // -------------------------------------------------------------------------
  // 1. Scroll state
  // -------------------------------------------------------------------------

  function updateScrollState() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState(); // apply immediately on page load

  // -------------------------------------------------------------------------
  // 2. Mobile nav helpers
  // -------------------------------------------------------------------------

  function isNavOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  function openNav() {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    header.classList.add('nav-open');
    // Prevent body scroll while the overlay menu is open
    document.body.style.overflow = 'hidden';

    // Move focus to the first nav link so keyboard users can tab through
    const firstLink = /** @type {HTMLAnchorElement | null} */ (nav.querySelector('.nav-link'));
    if (firstLink) {
      // Small delay to allow CSS display:block to apply before focusing
      requestAnimationFrame(() => firstLink.focus());
    }
  }

  function closeNav() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    header.classList.remove('nav-open');
    document.body.style.overflow = '';

    // Return focus to the toggle button so keyboard users stay oriented
    toggle.focus();
  }

  // -------------------------------------------------------------------------
  // 3. Toggle button click
  // -------------------------------------------------------------------------

  toggle.addEventListener('click', () => {
    if (isNavOpen()) {
      closeNav();
    } else {
      openNav();
    }
  });

  // -------------------------------------------------------------------------
  // 4. Keyboard: Escape closes the nav
  // -------------------------------------------------------------------------

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isNavOpen()) {
      closeNav();
    }
  });

  // -------------------------------------------------------------------------
  // 5. Close when a nav link is clicked (smooth scroll to section)
  // -------------------------------------------------------------------------

  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (isNavOpen()) {
        // Close without returning focus to toggle — the browser will
        // move focus to the target section element via the anchor
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        header.classList.remove('nav-open');
        document.body.style.overflow = '';
      }
    });
  });

  // -------------------------------------------------------------------------
  // 6. Close when clicking outside the header (e.g., the overlay backdrop)
  // -------------------------------------------------------------------------

  document.addEventListener('click', (e) => {
    if (isNavOpen() && !header.contains(/** @type {Node} */ (e.target))) {
      closeNav();
    }
  });
}
