document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.horizontal-scroll-story').forEach(section => {
    const viewport = section.querySelector('.horizontal-scroll-viewport');
    const track = section.querySelector('.horizontal-scroll-track');
    if (!viewport || !track) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let travel = 0;
    let start = 0;
    let raf = 0;

    const viewportHeight = () =>
      Math.round(window.visualViewport?.height || window.innerHeight);

    function update() {
      raf = 0;
      if (reducedMotion.matches) return;

      const scrolledInside = window.scrollY - start;
      const x = Math.max(0, Math.min(travel, scrolledInside));
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
    }

    function requestUpdate() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    function measure() {
      if (reducedMotion.matches) {
        section.style.height = 'auto';
        track.style.transform = 'none';
        return;
      }

      const vh = viewportHeight();
      viewport.style.height = `${vh}px`;

      /*
       * Images are exactly one viewport high and sit directly beside each
       * other. Their rendered widths therefore determine total track width.
       */
      travel = Math.max(0, track.scrollWidth - window.innerWidth);

      /*
       * One viewport lets the panel become fully visible; the remaining
       * vertical distance is converted 1:1 into horizontal movement.
       */
      section.style.height = `${vh + travel}px`;

      start = section.getBoundingClientRect().top + window.scrollY;
      update();
    }

    const images = Array.from(track.querySelectorAll('img'));
    const ready = images.map(img => {
      if (img.complete && img.naturalWidth) return Promise.resolve();
      if (img.decode) return img.decode().catch(() => {});
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });

    Promise.all(ready).then(measure);

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    reducedMotion.addEventListener?.('change', measure);

    requestAnimationFrame(measure);
  });
});
