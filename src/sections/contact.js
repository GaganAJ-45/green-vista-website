const FORM_ENDPOINT = 'https://formspree.io/f/xvkzdyya';

export function initContact() {
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#contact-form-status');
  const submitButton = form?.querySelector('button[type="submit"]');
  const floatingContactButtons = Array.from(document.querySelectorAll('.whatsapp-float, .call-float'));
  if (!(form instanceof HTMLFormElement) || !status || !submitButton) return;

  function updateFloatingContactOverlap() {
    const controls = Array.from(form.querySelectorAll('input, select, textarea, button'));
    floatingContactButtons.forEach((button) => {
      const floatingRect = button.getBoundingClientRect();
      const overlapsControl = controls.some((control) => {
        const controlRect = control.getBoundingClientRect();
        return controlRect.width > 0 && controlRect.height > 0
          && floatingRect.left < controlRect.right
          && floatingRect.right > controlRect.left
          && floatingRect.top < controlRect.bottom
          && floatingRect.bottom > controlRect.top;
      });
      const keepFocusedButtonVisible = document.activeElement === button;
      const hide = overlapsControl && !keepFocusedButtonVisible;
      button.classList.toggle('is-obscured-by-contact', hide);
      button.inert = hide;
    });
  }

  window.addEventListener('scroll', updateFloatingContactOverlap, { passive: true });
  window.addEventListener('resize', updateFloatingContactOverlap, { passive: true });
  document.addEventListener('focusout', updateFloatingContactOverlap);
  updateFloatingContactOverlap();

  let submitting = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;

    submitting = true;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-disabled', 'true');
    status.className = 'contact-form-status is-pending';
    status.textContent = 'Sending your request…';

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (!response.ok) {
        let detail = '';
        try {
          const result = await response.json();
          detail = Array.isArray(result.errors)
            ? ` ${result.errors.map((error) => error.message).join(' ')}`
            : '';
        } catch {
          // Keep a useful generic message if the endpoint response is not JSON.
        }
        throw new Error(detail || ' Please check your connection and try again.');
      }

      form.reset();
      status.className = 'contact-form-status is-success';
      status.textContent = 'Thank you. Your request has been sent.';
      status.focus();
    } catch (error) {
      status.className = 'contact-form-status is-error';
      status.textContent = `We couldn’t send your request.${error instanceof Error ? error.message : ' Please check your connection and try again.'}`;
      status.focus();
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-disabled');
    }
  });
}
