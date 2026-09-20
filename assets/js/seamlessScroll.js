document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.horizontal-scroll-story').forEach(section => {
    const viewport = section.querySelector('.horizontal-scroll-viewport');
    const track = section.querySelector('.horizontal-scroll-track');
    if (!viewport || !track) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let travel = 0;
    let sectionTop = 0;
    let viewportH = window.innerHeight;
    let raf = 0;

    function getViewportHeight() {
      return Math.round(window.visualViewport?.height || window.innerHeight);
    }

    function setState(localY) {
      section.classList.remove('is-before', 'is-pinned', 'is-ended');

      if (localY < 0) {
        section.classList.add('is-before');
      } else if (localY < travel) {
        section.classList.add('is-pinned');
      } else {
        section.classList.add('is-ended');
      }
    }

    function update() {
      raf = 0;

      if (reducedMotion.matches) {
        track.style.transform = 'none';
        section.classList.remove('is-before', 'is-pinned', 'is-ended');
        return;
      }

      const localY = window.scrollY - sectionTop;
      const x = Math.max(0, Math.min(travel, localY));

      setState(localY);
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
    }

    function requestUpdate() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    function measure() {
      if (reducedMotion.matches) {
        section.style.height = 'auto';
        viewport.style.height = '';
        update();
        return;
      }

      viewportH = getViewportHeight();
      viewport.style.height = `${viewportH}px`;

      /*
       * The rendered image row is measured after the images have dimensions.
       * The full row moves exactly far enough for its right edge to meet the
       * right edge of the viewport.
       */
      travel = Math.max(0, track.scrollWidth - window.innerWidth);

      /*
       * While the stage is pinned, vertical distance is converted 1:1 to
       * horizontal travel. One viewport of height remains as the stage itself.
       */
      section.style.height = `${viewportH + travel}px`;

      /*
       * Measure the document position while the stage is in its normal
       * pre-pinned state. This prevents fixed positioning from changing the
       * reference point used for scroll progress.
       */
      section.classList.remove('is-pinned', 'is-ended');
      section.classList.add('is-before');
      sectionTop = section.getBoundingClientRect().top + window.scrollY;

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

    Promise.all(ready).then(() => requestAnimationFrame(measure));

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    reducedMotion.addEventListener?.('change', measure);

    requestAnimationFrame(measure);
  });
});
