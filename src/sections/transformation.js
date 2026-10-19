const MIN_POSITION = 0;
const MAX_POSITION = 100;
const KEY_STEP = 1;
const LARGE_KEY_STEP = 10;

function clampPosition(value) {
  return Math.min(MAX_POSITION, Math.max(MIN_POSITION, value));
}

export function initTransformation() {
  const comparison = document.querySelector('.transformation-compare');
  const handle = comparison?.querySelector('.transformation-handle');

  if (!comparison || !handle) return;

  let position = Number(handle.getAttribute('aria-valuenow')) || 50;

  function setPosition(nextPosition) {
    position = clampPosition(Math.round(nextPosition));
    comparison.style.setProperty('--comparison-position', `${position}%`);
    handle.setAttribute('aria-valuenow', String(position));
    handle.setAttribute('aria-valuetext', `${position}% Before, ${100 - position}% After`);
  }

  function setPositionFromPointer(event) {
    const bounds = comparison.getBoundingClientRect();
    const nextPosition = ((event.clientX - bounds.left) / bounds.width) * MAX_POSITION;
    setPosition(nextPosition);
  }

  handle.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    handle.setPointerCapture(event.pointerId);
    setPositionFromPointer(event);
  });

  handle.addEventListener('pointermove', (event) => {
    if (handle.hasPointerCapture(event.pointerId)) setPositionFromPointer(event);
  });

  handle.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? LARGE_KEY_STEP : KEY_STEP;
    let nextPosition = position;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        nextPosition -= step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        nextPosition += step;
        break;
      case 'Home':
        nextPosition = MIN_POSITION;
        break;
      case 'End':
        nextPosition = MAX_POSITION;
        break;
      default:
        return;
    }

    event.preventDefault();
    setPosition(nextPosition);
  });

  setPosition(position);
}
