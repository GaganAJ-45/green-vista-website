/** Accessible native-dialog gallery lightbox. */
export function initGallery() {
  const gallery = document.querySelector('.gallery-grid');
  const dialog = document.querySelector('#gallery-lightbox');
  if (!gallery || !(dialog instanceof HTMLDialogElement)) return;

  const lightboxImage = dialog.querySelector('.gallery-lightbox-image');
  const lightboxSource = dialog.querySelector('source[type="image/avif"]');
  const caption = dialog.querySelector('.gallery-lightbox-caption');
  const closeButton = dialog.querySelector('.gallery-lightbox-close');
  if (!lightboxImage || !lightboxSource || !caption || !closeButton) return;

  let opener = null;

  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('.gallery-item');
    if (!button || !gallery.contains(button)) return;

    const image = button.querySelector('img');
    const source = button.querySelector('source[type="image/avif"]');
    if (!image) return;

    opener = button;
    lightboxSource.srcset = source?.srcset || '';
    lightboxSource.sizes = image.sizes || '92vw';
    lightboxImage.srcset = image.srcset || '';
    lightboxImage.sizes = image.sizes || '92vw';
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    caption.textContent = button.dataset.caption || image.alt;

    if (!dialog.open) dialog.showModal();
    closeButton.focus();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    lightboxImage.removeAttribute('src');
    lightboxImage.removeAttribute('srcset');
    lightboxSource.removeAttribute('srcset');
    lightboxImage.alt = '';
    caption.textContent = '';
    opener?.focus();
    opener = null;
  });
}
