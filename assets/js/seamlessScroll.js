document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.polysapien-scroll-story').forEach(section => {
    const sticky = section.querySelector('.seamless-scroll-sticky');
    const track = section.querySelector('.seamless-scroll-track');
    if (!sticky || !track) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let travel = 0;
    let startY = 0;
    let ticking = false;

    function viewportHeight() {
      return window.visualViewport?.height || window.innerHeight;
    }

    function measure() {
      if (reducedMotion.matches) {
        section.style.height = 'auto';
        track.style.transform = 'none';
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportH = viewportHeight();

      /*
       * The sticky panel itself is exactly one viewport high. The section
       * gets one viewport of base height plus the horizontal travel distance.
       * That makes it release precisely after the last page reaches the screen.
       */
      travel = Math.max(0, track.scrollWidth - viewportWidth);
      section.style.height = `${viewportH + travel}px`;

      /*
       * Start horizontal movement only when the full-height sticky panel has
       * reached its pinned position at the top of the viewport.
       */
      startY = section.getBoundingClientRect().top + window.scrollY;
      update();
    }

    function update() {
      if (reducedMotion.matches) return;

      const horizontalProgress = Math.max(
        0,
        Math.min(travel, window.scrollY - startY)
      );

      track.style.transform = `translate3d(${-horizontalProgress}px, 0, 0)`;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    reducedMotion.addEventListener?.('change', measure);

    const images = Array.from(track.querySelectorAll('img'));
    Promise.all(images.map(img => {
      if (img.complete && img.naturalWidth) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })).then(() => {
      requestAnimationFrame(measure);
    });

    requestAnimationFrame(measure);
  });
});
