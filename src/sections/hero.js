/**
 * hero.js — Hero three-photograph crossfade slideshow controller
 * Green Vista (Phase 1)
 *
 * Requirements:
 *   - 3 photographs cycling with ~6s interval and ~1.2s smooth opacity crossfade
 *   - Automatic looping without flashes or layout shifts
 *   - 3 accessible slide indicator pills with click and keyboard support
 *   - Accessible pause/resume toggle with persistent visual icon & aria-label
 *   - Preload next slide images to prevent loading delay
 *   - Respect prefers-reduced-motion (disable auto-advance, keep static slide 1)
 */

const SLIDE_DURATION = 6000; // 6 seconds per slide

export function initHero() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const slides = Array.from(heroSection.querySelectorAll('.hero-slide'));
  const headlines = Array.from(heroSection.querySelectorAll('.hero-headline'));
  const indicatorBtns = Array.from(heroSection.querySelectorAll('.hero-indicator-btn'));
  const pauseBtn = heroSection.querySelector('#hero-pause-toggle');
  const captionEl = heroSection.querySelector('#hero-active-caption');

  if (slides.length === 0) return;

  let currentIndex = 0;
  let timerId = null;
  let isPaused = false;

  const captions = [
    'Villa Landscaping (Residential garden)',
    'Outdoor living (Designed for everyday use)',
    'Evening outdoor living (Featured transformation)'
  ];

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helper to preload next image
  function preloadSlide(index) {
    const slide = slides[index];
    if (!slide) return;
    const img = slide.querySelector('img');
    if (img && img.loading === 'lazy') {
      img.loading = 'eager';
    }
  }

  function goToSlide(index) {
    if (index === currentIndex && slides[index].classList.contains('is-active')) {
      return;
    }

    // Deactivate previous slide & headline
    slides[currentIndex].classList.remove('is-active');
    slides[currentIndex].setAttribute('aria-hidden', 'true');
    if (headlines[currentIndex]) {
      headlines[currentIndex].classList.remove('is-active');
      headlines[currentIndex].setAttribute('aria-hidden', 'true');
    }
    if (indicatorBtns[currentIndex]) {
      indicatorBtns[currentIndex].classList.remove('is-active');
      indicatorBtns[currentIndex].setAttribute('aria-selected', 'false');
    }

    // Activate new slide & headline synchronously
    currentIndex = index;
    slides[currentIndex].classList.add('is-active');
    slides[currentIndex].setAttribute('aria-hidden', 'false');
    if (headlines[currentIndex]) {
      headlines[currentIndex].classList.add('is-active');
      headlines[currentIndex].setAttribute('aria-hidden', 'false');
    }
    if (indicatorBtns[currentIndex]) {
      indicatorBtns[currentIndex].classList.add('is-active');
      indicatorBtns[currentIndex].setAttribute('aria-selected', 'true');
    }

    // Update live caption
    if (captionEl && captions[currentIndex]) {
      captionEl.textContent = captions[currentIndex];
    }

    // Preload next image in loop
    const nextIndex = (currentIndex + 1) % slides.length;
    preloadSlide(nextIndex);
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  }

  function startSlideshow() {
    if (prefersReducedMotion || isPaused) return;
    stopSlideshow();
    timerId = setInterval(nextSlide, SLIDE_DURATION);
  }

  function stopSlideshow() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
      stopSlideshow();
      if (pauseBtn) {
        pauseBtn.setAttribute('aria-label', 'Resume automatic slideshow');
        pauseBtn.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        `;
      }
    } else {
      if (pauseBtn) {
        pauseBtn.setAttribute('aria-label', 'Pause automatic slideshow');
        pauseBtn.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        `;
      }
      startSlideshow();
    }
  }

  // Indicator click handlers
  indicatorBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      goToSlide(idx);
      if (!isPaused && !prefersReducedMotion) {
        startSlideshow(); // Reset timer so it gets full 6s from click
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        const nextIdx = (idx + 1) % indicatorBtns.length;
        indicatorBtns[nextIdx].focus();
        indicatorBtns[nextIdx].click();
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (idx - 1 + indicatorBtns.length) % indicatorBtns.length;
        indicatorBtns[prevIdx].focus();
        indicatorBtns[prevIdx].click();
      }
    });
  });

  // Pause button listener
  if (pauseBtn) {
    pauseBtn.addEventListener('click', togglePause);
  }

  // Initialize first state
  goToSlide(0);

  // If reduced motion is requested, do not run the interval timer
  if (!prefersReducedMotion) {
    startSlideshow();
  }
}
