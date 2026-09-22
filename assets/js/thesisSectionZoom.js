(() => {
  const map = document.querySelector('[data-thesis-section-zoom]');
  const modal = document.getElementById('thesisSectionZoomModal');
  if (!map || !modal) return;

  const hotspots = Array.from(map.querySelectorAll('[data-zoom-src]'));
  const image = modal.querySelector('.thesis-section-zoom-image');
  const closeButton = modal.querySelector('.thesis-section-zoom-close');
  const customCursor = document.getElementById('customCursor');
  let returnFocus = null;

  const setPlusCursor = (active) => {
    if (customCursor) customCursor.classList.toggle('is-thesis-zoom-plus', active);
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('thesis-section-zoom-open');
    image.removeAttribute('src');
    setPlusCursor(false);

    if (returnFocus) {
      returnFocus.focus();
      returnFocus = null;
    }
  };

  const open = (hotspot) => {
    const src = hotspot.dataset.zoomSrc;
    if (!src) return;

    returnFocus = hotspot;
    image.src = src;
    image.alt = hotspot.getAttribute('aria-label') || 'Enlarged thesis image section';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('thesis-section-zoom-open');
    setPlusCursor(false);
    closeButton.focus();
  };

  hotspots.forEach((hotspot) => {
    hotspot.addEventListener('mouseenter', () => setPlusCursor(true));
    hotspot.addEventListener('mouseleave', () => setPlusCursor(false));
    hotspot.addEventListener('focus', () => setPlusCursor(true));
    hotspot.addEventListener('blur', () => setPlusCursor(false));
    hotspot.addEventListener('click', () => open(hotspot));
  });

  closeButton.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();
