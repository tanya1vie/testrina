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
        const ratio = ratioFor(0);
        book.style.setProperty('--book-aspect', ratio);
        book.style.setProperty('--verso-flex', '0');
        book.style.setProperty('--recto-flex', String(ratio));
        return;
      }

      const leftRatio = leftIndex < imagePaths.length ? ratioFor(leftIndex) : 0;
      const rightRatio = rightIndex < imagePaths.length ? ratioFor(rightIndex) : 0;
      const totalRatio = Math.max(0.2, leftRatio + rightRatio);

      book.style.setProperty('--book-aspect', totalRatio);
      book.style.setProperty('--verso-flex', String(leftRatio || 0.0001));
      book.style.setProperty('--recto-flex', String(rightRatio || 0.0001));
    }

    container.className = 'magazine-booklet-wrap';
    container.innerHTML = `<button type="button" class="magazine-booklet-arrow prev" aria-label="Previous spread">❮</button><div class="magazine-booklet" role="group"><div class="magazine-page verso" role="img"></div><div class="magazine-page recto" role="img"></div></div><button type="button" class="magazine-booklet-arrow next" aria-label="Next spread">❯</button>`;

    const book = container.querySelector('.magazine-booklet');
    const verso = container.querySelector('.magazine-page.verso');
    const recto = container.querySelector('.magazine-page.recto');
    const prev = container.querySelector('.magazine-booklet-arrow.prev');
    const next = container.querySelector('.magazine-booklet-arrow.next');
    if (label) book.setAttribute('aria-label', label);

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
      if (event.key === 'ArrowRight' && !next.disabled) {
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
  document.querySelectorAll('[data-booklet]').forEach(initMagazineBooklet);

  if (document.querySelector('main .project-header') && !document.querySelector('script[data-project-figures]')) {
    const figures = document.createElement('script');
    figures.src = 'assets/js/projectFigures.js';
    figures.dataset.projectFigures = 'true';
    document.body.appendChild(figures);
  }
});