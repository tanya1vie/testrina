document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.polysapien-scroll-story').forEach(section => {
    const sticky = section.querySelector('.seamless-scroll-sticky');
    const track = section.querySelector('.seamless-scroll-track');
    if (!sticky || !track) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let travel = 0;
    let sectionTop = 0;
    let ticking = false;

    function measure() {
      if (media.matches) {
        section.style.height = 'auto';
        track.style.transform = '';
        return;
      }

      const viewportWidth = sticky.clientWidth || window.innerWidth;
      travel = Math.max(0, track.scrollWidth - viewportWidth);
      sectionTop = section.getBoundingClientRect().top + window.scrollY;

      /* Give the user exactly enough vertical distance to travel from
         the first image to the last, then release the sticky section. */
      section.style.height = `${window.innerHeight + travel}px`;
      update();
    }

    function update() {
      if (media.matches) return;

      const progress = Math.max(
        0,
        Math.min(travel, window.scrollY - sectionTop)
      );

      track.style.transform = `translate3d(${-progress}px, 0, 0)`;
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
    media.addEventListener?.('change', measure);

    const images = Array.from(track.querySelectorAll('img'));
    Promise.all(images.map(img => {
      if (img.complete && img.naturalWidth) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })).then(measure);

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(track);
      resizeObserver.observe(sticky);
    }

    measure();
  });
});
