document.addEventListener('DOMContentLoaded', () => {
  function initMainFlipbook() {
    const leftPage = document.getElementById('pageLeft');
    const rightPage = document.getElementById('pageRight');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!leftPage || !rightPage || !prevBtn || !nextBtn) return;

    const imagePaths = Array.from(document.querySelectorAll('#flipbookImages img'))
      .map(img => img.getAttribute('src'))
      .filter(Boolean);
    if (!imagePaths.length) return;

    let currentSpreadIndex = 0;
    const maxSpreads = Math.ceil((imagePaths.length - 1) / 2);

    function updateView() {
      if (currentSpreadIndex === 0) {
        leftPage.style.backgroundImage = '';
        leftPage.style.opacity = '0';
        leftPage.style.pointerEvents = 'none';
        rightPage.style.backgroundImage = `url('${imagePaths[0]}')`;
      } else {
        leftPage.style.opacity = '1';
        leftPage.style.pointerEvents = 'auto';
        const pairIndex = currentSpreadIndex - 1;
        const leftIdx = 1 + pairIndex * 2;
        const rightIdx = leftIdx + 1;
        leftPage.style.backgroundImage = imagePaths[leftIdx] ? `url('${imagePaths[leftIdx]}')` : '';
        rightPage.style.backgroundImage = imagePaths[rightIdx] ? `url('${imagePaths[rightIdx]}')` : '';
      }
      prevBtn.disabled = currentSpreadIndex === 0;
      nextBtn.disabled = currentSpreadIndex >= maxSpreads;
    }

    nextBtn.addEventListener('click', () => {
      if (currentSpreadIndex >= maxSpreads) return;
      const targetIndex = currentSpreadIndex + 1;
      rightPage.classList.add('turning');
      rightPage.addEventListener('animationend', () => {
        rightPage.classList.remove('turning');
        rightPage.style.transform = '';
        currentSpreadIndex = targetIndex;
        updateView();
      }, { once: true });
    });

    prevBtn.addEventListener('click', () => {
      if (currentSpreadIndex <= 0) return;
      currentSpreadIndex -= 1;
      updateView();
    });

    updateView();
  }

  function initSingleSpreadBooklet(container) {
    if (!container) return;

    const label = container.dataset.label || '';
    const sourceImages = Array.from(container.querySelectorAll('img'));
    const imagePaths = sourceImages.map(img => img.getAttribute('src')).filter(Boolean);
    if (!imagePaths.length) return;

    const imageRatios = sourceImages
      .filter(img => img.getAttribute('src'))
      .map(img => {
        const width = Number(img.getAttribute('width')) || img.naturalWidth || 0;
        const height = Number(img.getAttribute('height')) || img.naturalHeight || 0;
        return width > 0 && height > 0 ? width / height : null;
      });

    container.className = 'magazine-booklet-wrap single-spread-booklet-wrap';
    container.innerHTML = `<button type="button" class="magazine-booklet-expand" aria-label="Open booklet fullscreen" title="Open fullscreen">⛶</button><button type="button" class="magazine-booklet-close" aria-label="Close fullscreen booklet" title="Close fullscreen">×</button><button type="button" class="magazine-booklet-arrow prev" aria-label="Previous spread">❮</button><div class="magazine-booklet single-spread-booklet" role="group"><div class="single-spread-current" role="img"></div><div class="single-spread-fold" aria-hidden="true"><div class="single-spread-half single-spread-half-left"><div class="single-spread-half-image"></div></div><div class="single-spread-half single-spread-half-right"><div class="single-spread-half-image"></div></div></div></div><button type="button" class="magazine-booklet-arrow next" aria-label="Next spread">❯</button>`;

    const book = container.querySelector('.single-spread-booklet');
    const current = container.querySelector('.single-spread-current');
    const fold = container.querySelector('.single-spread-fold');
    const foldImages = Array.from(container.querySelectorAll('.single-spread-half-image'));
    const prev = container.querySelector('.magazine-booklet-arrow.prev');
    const next = container.querySelector('.magazine-booklet-arrow.next');
    const expand = container.querySelector('.magazine-booklet-expand');
    const close = container.querySelector('.magazine-booklet-close');

    if (label) book.setAttribute('aria-label', label);

    let spreadIndex = 0;
    let animating = false;

    function ratioFor(index) {
      return imageRatios[index] || 1.5;
    }

    function setGeometry(index) {
      const ratio = index === 0 && imagePaths.length > 1
        ? ratioFor(1)
        : ratioFor(index);
      book.style.setProperty('--book-aspect', ratio);
      container.style.setProperty('--book-aspect', ratio);
    }

    function render() {
      book.classList.toggle('is-cover', spreadIndex === 0);
      setGeometry(spreadIndex);
      current.style.backgroundImage = `url('${imagePaths[spreadIndex]}')`;
      current.setAttribute('aria-label', `Booklet spread ${spreadIndex + 1}`);
      prev.disabled = spreadIndex === 0;
      next.disabled = spreadIndex >= imagePaths.length - 1;
    }

    function openFullscreen() {
      container.classList.add('is-fullscreen');
      document.body.classList.add('booklet-fullscreen-open');
      close.focus();
    }

    function closeFullscreen() {
      container.classList.remove('is-fullscreen');
      document.body.classList.remove('booklet-fullscreen-open');
      expand.focus();
    }

    function prepareFold(src, direction) {
      foldImages.forEach(img => {
        img.style.backgroundImage = `url('${src}')`;
      });
      fold.classList.remove('fold-forward', 'fold-backward');
      fold.classList.add('is-active', direction);
    }

    function finishFold(direction, targetIndex) {
      fold.classList.remove('is-active', direction);
      spreadIndex = targetIndex;
      animating = false;
      render();
    }

    next.addEventListener('click', () => {
      if (animating || spreadIndex >= imagePaths.length - 1) return;
      animating = true;
      const previousSrc = imagePaths[spreadIndex];
      const targetIndex = spreadIndex + 1;

      book.classList.toggle('is-cover', targetIndex === 0);
      setGeometry(targetIndex);
      current.style.backgroundImage = `url('${imagePaths[targetIndex]}')`;
      current.setAttribute('aria-label', `Booklet spread ${targetIndex + 1}`);

      prepareFold(previousSrc, 'fold-forward');
      const rightHalf = fold.querySelector('.single-spread-half-right');
      rightHalf.addEventListener('animationend', () => finishFold('fold-forward', targetIndex), { once: true });
    });

    prev.addEventListener('click', () => {
      if (animating || spreadIndex <= 0) return;
      animating = true;
      const previousSrc = imagePaths[spreadIndex];
      const targetIndex = spreadIndex - 1;

      setGeometry(targetIndex);
      current.style.backgroundImage = `url('${imagePaths[targetIndex]}')`;
      current.setAttribute('aria-label', `Booklet spread ${targetIndex + 1}`);

      prepareFold(previousSrc, 'fold-backward');
      const leftHalf = fold.querySelector('.single-spread-half-left');
      leftHalf.addEventListener('animationend', () => finishFold('fold-backward', targetIndex), { once: true });
    });

    expand.addEventListener('click', openFullscreen);
    close.addEventListener('click', closeFullscreen);

    container.addEventListener('keydown', event => {
      if (event.key === 'Escape' && container.classList.contains('is-fullscreen')) {
        event.preventDefault();
        closeFullscreen();
      } else if (event.key === 'ArrowRight' && !next.disabled) {
        event.preventDefault();
        next.click();
      } else if (event.key === 'ArrowLeft' && !prev.disabled) {
        event.preventDefault();
        prev.click();
      }
    });

    imagePaths.forEach((src, index) => {
      if (imageRatios[index]) return;
      const probe = new Image();
      probe.onload = () => {
        if (!probe.naturalWidth || !probe.naturalHeight) return;
        imageRatios[index] = probe.naturalWidth / probe.naturalHeight;
        if (index === spreadIndex) render();
      };
      probe.src = src;
    });

    render();
  }

  function initMagazineBooklet(container) {
    if (!container) return;
    const label = container.dataset.label || '';
    const sourceImages = Array.from(container.querySelectorAll('img'));
    const imagePaths = sourceImages.map(img => img.getAttribute('src')).filter(Boolean);
    if (!imagePaths.length) return;

    const imageRatios = sourceImages
      .filter(img => img.getAttribute('src'))
      .map(img => {
        const width = Number(img.getAttribute('width')) || img.naturalWidth || 0;
        const height = Number(img.getAttribute('height')) || img.naturalHeight || 0;
        return width > 0 && height > 0 ? width / height : null;
      });

    function ratioFor(index) {
      return imageRatios[index] || 0.75;
    }

    function setBookGeometry(leftIndex, rightIndex, coverOnly = false) {
      if (coverOnly) {
        const coverRatio = ratioFor(0);

        if (imagePaths.length > 1) {
          const firstInteriorRatio = ratioFor(1);
          const secondInteriorRatio = imagePaths.length > 2 ? ratioFor(2) : firstInteriorRatio;
          const spreadRatio = Math.max(coverRatio, firstInteriorRatio + secondInteriorRatio);
          const blankRatio = Math.max(0.0001, spreadRatio - coverRatio);

          book.style.setProperty('--book-aspect', spreadRatio);
          container.style.setProperty('--book-aspect', spreadRatio);
          book.style.setProperty('--verso-flex', String(blankRatio));
          book.style.setProperty('--recto-flex', String(coverRatio));
        } else {
          book.style.setProperty('--book-aspect', coverRatio);
          container.style.setProperty('--book-aspect', coverRatio);
          book.style.setProperty('--verso-flex', '0.0001');
          book.style.setProperty('--recto-flex', String(coverRatio));
        }
        return;
      }

      const leftRatio = leftIndex < imagePaths.length ? ratioFor(leftIndex) : 0;
      const rightRatio = rightIndex < imagePaths.length ? ratioFor(rightIndex) : 0;
      const totalRatio = Math.max(0.2, leftRatio + rightRatio);

      book.style.setProperty('--book-aspect', totalRatio);
      container.style.setProperty('--book-aspect', totalRatio);
      book.style.setProperty('--verso-flex', String(leftRatio || 0.0001));
      book.style.setProperty('--recto-flex', String(rightRatio || 0.0001));
    }

    container.className = 'magazine-booklet-wrap';
    container.innerHTML = `<button type="button" class="magazine-booklet-expand" aria-label="Open booklet fullscreen" title="Open fullscreen">⛶</button><button type="button" class="magazine-booklet-close" aria-label="Close fullscreen booklet" title="Close fullscreen">×</button><button type="button" class="magazine-booklet-arrow prev" aria-label="Previous spread">❮</button><div class="magazine-booklet" role="group"><div class="magazine-page verso" role="img"></div><div class="magazine-page recto" role="img"></div></div><button type="button" class="magazine-booklet-arrow next" aria-label="Next spread">❯</button>`;

    const book = container.querySelector('.magazine-booklet');
    const verso = container.querySelector('.magazine-page.verso');
    const recto = container.querySelector('.magazine-page.recto');
    const prev = container.querySelector('.magazine-booklet-arrow.prev');
    const next = container.querySelector('.magazine-booklet-arrow.next');
    const expand = container.querySelector('.magazine-booklet-expand');
    const close = container.querySelector('.magazine-booklet-close');
    if (label) book.setAttribute('aria-label', label);

    function openFullscreen() {
      container.classList.add('is-fullscreen');
      document.body.classList.add('booklet-fullscreen-open');
      close.focus();
    }

    function closeFullscreen() {
      container.classList.remove('is-fullscreen');
      document.body.classList.remove('booklet-fullscreen-open');
      expand.focus();
    }

    expand.addEventListener('click', openFullscreen);
    close.addEventListener('click', closeFullscreen);

    let spreadIndex = 0;
    const spreadCount = Math.ceil((imagePaths.length - 1) / 2);
    let animating = false;

    function render() {
      if (spreadIndex === 0) {
        book.classList.add('is-cover');
        setBookGeometry(0, 0, true);
        verso.style.backgroundImage = '';
        recto.style.backgroundImage = `url('${imagePaths[0]}')`;
        verso.setAttribute('aria-label', 'Blank inside cover');
        recto.setAttribute('aria-label', label ? `${label} cover` : 'Booklet cover');
      } else {
        book.classList.remove('is-cover');
        const pairIndex = spreadIndex - 1;
        const leftIndex = 1 + pairIndex * 2;
        const rightIndex = leftIndex + 1;
        const leftSrc = imagePaths[leftIndex] || '';
        const rightSrc = imagePaths[rightIndex] || '';
        setBookGeometry(leftIndex, rightIndex);
        verso.style.backgroundImage = leftSrc ? `url('${leftSrc}')` : '';
        recto.style.backgroundImage = rightSrc ? `url('${rightSrc}')` : '';
        verso.setAttribute('aria-label', leftSrc ? `Booklet page ${leftIndex + 1}` : 'Blank verso');
        recto.setAttribute('aria-label', rightSrc ? `Booklet page ${rightIndex + 1}` : 'Blank recto');
      }
      prev.disabled = spreadIndex === 0;
      next.disabled = spreadIndex >= spreadCount;
    }

    function finishFlip(page, className, targetIndex) {
      page.classList.remove(className);
      page.style.transform = '';
      spreadIndex = targetIndex;
      animating = false;
      render();
    }

    next.addEventListener('click', () => {
      if (animating || spreadIndex >= spreadCount) return;
      animating = true;
      const targetIndex = spreadIndex + 1;
      recto.classList.add('flip-forward');
      recto.addEventListener('animationend', () => finishFlip(recto, 'flip-forward', targetIndex), { once: true });
    });

    prev.addEventListener('click', () => {
      if (animating || spreadIndex <= 0) return;
      animating = true;
      const targetIndex = spreadIndex - 1;
      verso.classList.add('flip-backward');
      verso.addEventListener('animationend', () => finishFlip(verso, 'flip-backward', targetIndex), { once: true });
    });

    container.addEventListener('keydown', event => {
      if (event.key === 'Escape' && container.classList.contains('is-fullscreen')) {
        event.preventDefault();
        closeFullscreen();
      } else if (event.key === 'ArrowRight' && !next.disabled) {
        event.preventDefault();
        next.click();
      } else if (event.key === 'ArrowLeft' && !prev.disabled) {
        event.preventDefault();
        prev.click();
      }
    });

    render();

    imagePaths.forEach((src, index) => {
      if (imageRatios[index]) return;
      const probe = new Image();
      probe.onload = () => {
        if (!probe.naturalWidth || !probe.naturalHeight) return;
        imageRatios[index] = probe.naturalWidth / probe.naturalHeight;

        if (
          spreadIndex === 0 && index === 0 ||
          spreadIndex > 0 && (
            index === 1 + (spreadIndex - 1) * 2 ||
            index === 2 + (spreadIndex - 1) * 2
          )
        ) {
          render();
        }
      };
      probe.src = src;
    });
  }

  initMainFlipbook();
  document.querySelectorAll('[data-booklet]').forEach(container => {
    if (container.dataset.bookletMode === 'single-spread') {
      initSingleSpreadBooklet(container);
    } else {
      initMagazineBooklet(container);
    }
  });

  if (document.querySelector('main .project-header') && !document.querySelector('script[data-project-figures]')) {
    const figures = document.createElement('script');
    figures.src = 'assets/js/projectFigures.js';
    figures.dataset.projectFigures = 'true';
    document.body.appendChild(figures);
  }
});