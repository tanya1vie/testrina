(() => {
  const carousels = Array.from(document.querySelectorAll('[data-feedback-carousel]'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  carousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('[data-feedback-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-feedback-dot]'));
    const previous = carousel.querySelector('[data-feedback-prev]');
    const next = carousel.querySelector('[data-feedback-next]');
    const status = carousel.querySelector('[data-feedback-status]');
    if (slides.length < 2 || !previous || !next) return;

    let index = 0;
    let timer = null;

    const show = (nextIndex, announce = true) => {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.hidden = !active;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-pressed', String(active));
      });

      if (status) {
        status.textContent = `Participant ${index + 1} of ${slides.length}`;
        status.setAttribute('aria-live', announce ? 'polite' : 'off');
      }
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (reduceMotion || document.hidden) return;
      timer = window.setInterval(() => show(index + 1, false), 10000);
    };

    const navigate = (nextIndex) => {
      show(nextIndex);
      start();
    };

    previous.addEventListener('click', () => navigate(index - 1));
    next.addEventListener('click', () => navigate(index + 1));
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => navigate(dotIndex));
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) start();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    show(0, false);
    start();
  });
})();
