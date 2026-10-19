/**
 * reveal.js — one-time, reduced-motion-aware section reveals.
 * Content stays visible unless IntersectionObserver is ready to reveal it.
 */

export function initReveal() {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) return;

  let observer;

  try {
    const targets = new Set();
    const mark = (elements, type, delay = 0) => {
      elements.forEach((element, index) => {
        element.dataset.reveal = type;
        const itemDelay = typeof delay === 'function' ? delay(index) : delay;
        if (itemDelay) element.style.setProperty('--reveal-delay', `${itemDelay}ms`);
        targets.add(element);
      });
    };

    mark(document.querySelectorAll('main section h2'), 'heading');
    mark(document.querySelectorAll(
      '.intro-lead, .project-desc, .contact-intro',
    ), 'copy', 100);

    mark(document.querySelectorAll('.project-picture, .gallery-item picture'), 'image');
    mark(document.querySelectorAll('.process-step'), 'step', index => index * 80);
    mark(document.querySelectorAll('.contact-form'), 'form');
    mark(document.querySelectorAll('.site-footer'), 'footer');

    observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -6% 0px',
    });

    targets.forEach(target => observer.observe(target));
    root.classList.add('reveal-ready');
  } catch {
    observer?.disconnect();
    root.classList.remove('reveal-ready');
  }
}
