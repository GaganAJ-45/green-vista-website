const AUTOPLAY_INTERVAL = 5600;
const INTERACTION_PAUSE = 6500;

export function initTestimonials() {
  const track = document.querySelector('#testimonials-track');
  const section = document.querySelector('#testimonials');
  const floatingContactButtons = Array.from(document.querySelectorAll('.whatsapp-float, .call-float'));
  const previousButton = document.querySelector('[data-testimonial-prev]');
  const nextButton = document.querySelector('[data-testimonial-next]');
  if (!track || !previousButton || !nextButton) return;

  const originals = Array.from(track.children);
  const count = originals.length;
  if (count < 2) return;

  const cloneSlide = (slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('aria-label');
    clone.dataset.testimonialClone = 'true';
    return clone;
  };

  const leadingClones = originals.map(cloneSlide);
  const trailingClones = originals.map(cloneSlide);
  track.prepend(...leadingClones);
  track.append(...trailingClones);

  const slides = Array.from(track.children);
  const cloneCount = leadingClones.length;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentIndex = 0;
  let isHovered = false;
  let hasFocus = false;
  let interactionPausedUntil = 0;
  let settleTimer = 0;
  let isProgrammaticScroll = false;
  let programmaticScrollTimer = 0;

  function updateFloatingContactOverlap() {
    if (floatingContactButtons.length === 0) return;
    if (window.innerWidth > 704) {
      floatingContactButtons.forEach((button) => {
        button.classList.remove('is-obscured-by-testimonials');
        button.inert = false;
      });
      return;
    }

    const physicalIndex = normalizePhysicalIndex(nearestPhysicalIndex());
    const visibleSlide = slides[physicalIndex];
    const card = visibleSlide.getBoundingClientRect();
    floatingContactButtons.forEach((button) => {
      const fab = button.getBoundingClientRect();
      const intersects = fab.left < card.right && fab.right > card.left && fab.top < card.bottom && fab.bottom > card.top;
      const keepFocusedLinkVisible = document.activeElement === button;
      const hide = intersects && !keepFocusedLinkVisible;
      button.classList.toggle('is-obscured-by-testimonials', hide);
      button.inert = hide;
    });
  }

  function nearestPhysicalIndex() {
    let nearest = 0;
    let nearestDistance = Infinity;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function normalizePhysicalIndex(physicalIndex) {
    if (physicalIndex < cloneCount) return physicalIndex + count;
    if (physicalIndex >= cloneCount + count) return physicalIndex - count;
    return physicalIndex;
  }

  function scrollToPhysical(physicalIndex, smooth = true) {
    const target = slides[physicalIndex];
    if (!target) return;
    isProgrammaticScroll = true;
    window.clearTimeout(programmaticScrollTimer);
    track.scrollTo({
      left: target.offsetLeft,
      behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto',
    });
    programmaticScrollTimer = window.setTimeout(() => { isProgrammaticScroll = false; }, 800);
  }

  function move(direction) {
    const physicalIndex = nearestPhysicalIndex();
    const logicalIndex = (physicalIndex - cloneCount + count) % count;
    currentIndex = (logicalIndex + direction + count) % count;
    let targetPhysicalIndex = cloneCount + currentIndex;

    if (direction > 0 && logicalIndex === count - 1) targetPhysicalIndex = cloneCount + count;
    if (direction < 0 && logicalIndex === 0) targetPhysicalIndex = cloneCount - 1;

    scrollToPhysical(targetPhysicalIndex);
  }

  function pauseAfterInteraction() {
    interactionPausedUntil = Date.now() + INTERACTION_PAUSE;
  }

  track.scrollLeft = slides[cloneCount].offsetLeft;

  previousButton.addEventListener('click', () => {
    pauseAfterInteraction();
    move(-1);
  });

  nextButton.addEventListener('click', () => {
    pauseAfterInteraction();
    move(1);
  });

  track.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    pauseAfterInteraction();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });

  track.addEventListener('scroll', () => {
    if (!isProgrammaticScroll) pauseAfterInteraction();
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      const physicalIndex = nearestPhysicalIndex();
      currentIndex = (physicalIndex - cloneCount + count) % count;
      const normalizedIndex = normalizePhysicalIndex(physicalIndex);
      if (normalizedIndex !== physicalIndex) {
        track.scrollLeft = slides[normalizedIndex].offsetLeft;
      }
      updateFloatingContactOverlap();
    }, 180);
  }, { passive: true });

  track.addEventListener('pointerdown', pauseAfterInteraction, { passive: true });
  track.addEventListener('touchstart', pauseAfterInteraction, { passive: true });
  track.addEventListener('wheel', pauseAfterInteraction, { passive: true });
  track.addEventListener('pointerup', pauseAfterInteraction, { passive: true });
  track.addEventListener('touchend', pauseAfterInteraction, { passive: true });
  section?.addEventListener('pointerenter', () => { isHovered = true; });
  section?.addEventListener('pointerleave', () => { isHovered = false; });
  section?.addEventListener('focusin', () => { hasFocus = true; });
  section?.addEventListener('focusout', (event) => {
    if (!section.contains(event.relatedTarget)) hasFocus = false;
  });

  window.addEventListener('scroll', updateFloatingContactOverlap, { passive: true });
  window.addEventListener('resize', updateFloatingContactOverlap, { passive: true });
  document.addEventListener('focusout', updateFloatingContactOverlap);
  updateFloatingContactOverlap();

  window.addEventListener('resize', () => {
    const physicalIndex = cloneCount + currentIndex;
    track.scrollLeft = slides[physicalIndex].offsetLeft;
    updateFloatingContactOverlap();
  }, { passive: true });

  window.setInterval(() => {
    const interactionIsPaused = Date.now() < interactionPausedUntil;
    if (reducedMotion.matches || isHovered || hasFocus || interactionIsPaused) return;
    move(1);
  }, AUTOPLAY_INTERVAL);
}
