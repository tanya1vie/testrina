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

    function goNext() {
      if (currentSpreadIndex >= maxSpreads) return;
      const targetIndex = currentSpreadIndex + 1;
      rightPage.classList.add('turning');

      const finish = () => {
        rightPage.classList.remove('turning');
        rightPage.style.transform = '';
        currentSpreadIndex = targetIndex;
        updateView();
      };

      rightPage.addEventListener('animationend', finish, { once: true });
    }

    function goPrev() {
      if (currentSpreadIndex <= 0) return;
      currentSpreadIndex -= 1;
      updateView();
    }

    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);
    updateView();
  }

  function addMagazineBookStyles() {
    if (document.getElementById('thesisMagazineBookStyles')) return;

    const style = document.createElement('style');
    style.id = 'thesisMagazineBookStyles';
    style.textContent = `
      .thesis-book-archive {
        width: 100%;
        margin: 72px 0;
      }

      .thesis-book-archive h2 {
        margin: 0 0 24px;
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .magazine-booklet-wrap {
        width: min(82vw, 980px);
        margin: 0 auto;
        position: relative;
        padding: 0 44px;
        box-sizing: border-box;
      }

      .magazine-booklet {
        width: 100%;
        aspect-ratio: 1.48 / 1;
        display: flex;
        position: relative;
        overflow: visible;
        perspective: 1800px;
        filter: drop-shadow(0 10px 18px rgba(0,0,0,0.16));
      }

      .magazine-page {
        position: relative;
        flex: 1 1 50%;
        min-width: 0;
        background-color: #fffdf7;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        backface-visibility: hidden;
        transform-style: preserve-3d;
      }

      .magazine-page.verso {
        border-right: 1px solid rgba(0,0,0,0.12);
        transform-origin: right center;
      }

      .magazine-page.recto {
        border-left: 1px solid rgba(0,0,0,0.12);
        transform-origin: left center;
      }

      .magazine-booklet::after {
        content: '';
        position: absolute;
        inset: 0 auto 0 50%;
        width: 1px;
        background: rgba(0,0,0,0.08);
        box-shadow: 0 0 10px rgba(0,0,0,0.12);
        pointer-events: none;
        z-index: 5;
      }

      .magazine-page.flip-forward {
        animation: magazineFlipForward 720ms cubic-bezier(.25,.8,.25,1);
        z-index: 4;
      }

      .magazine-page.flip-backward {
        animation: magazineFlipBackward 720ms cubic-bezier(.25,.8,.25,1);
        z-index: 4;
      }

      @keyframes magazineFlipForward {
        from { transform: rotateY(0deg); }
        to { transform: rotateY(-180deg); }
      }

      @keyframes magazineFlipBackward {
        from { transform: rotateY(0deg); }
        to { transform: rotateY(180deg); }
      }

      .magazine-booklet-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        border: 0;
        background: transparent;
        color: inherit;
        padding: 8px;
        font: inherit;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1;
        cursor: pointer;
        z-index: 10;
      }

      .magazine-booklet-arrow.prev { left: 0; }
      .magazine-booklet-arrow.next { right: 0; }

      .magazine-booklet-arrow:disabled {
        opacity: 0.2;
        cursor: default;
      }

      .magazine-booklet-status {
        margin: 12px 0 0;
        text-align: center;
        font-size: 0.88rem;
        opacity: 0.65;
      }

      @media (max-width: 700px) {
        .thesis-book-archive { margin: 52px 0; }
        .magazine-booklet-wrap {
          width: 100%;
          padding: 0 32px;
        }
        .magazine-booklet {
          aspect-ratio: 1.36 / 1;
        }
        .magazine-booklet-arrow {
          font-size: 30px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .magazine-page.flip-forward,
        .magazine-page.flip-backward {
          animation-duration: 1ms;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function initMagazineBooklet(containerId, label) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const imagePaths = Array.from(container.querySelectorAll('img'))
      .map(img => img.getAttribute('src'))
      .filter(Boolean);

    if (imagePaths.length < 2) return;

    container.className = 'magazine-booklet-wrap';
    container.innerHTML = `
      <button type="button" class="magazine-booklet-arrow prev" aria-label="Previous ${label} spread">❮</button>
      <div class="magazine-booklet" role="group" aria-label="${label} booklet">
        <div class="magazine-page verso" role="img"></div>
        <div class="magazine-page recto" role="img"></div>
      </div>
      <button type="button" class="magazine-booklet-arrow next" aria-label="Next ${label} spread">❯</button>
      <p class="magazine-booklet-status" aria-live="polite"></p>
    `;

    const verso = container.querySelector('.magazine-page.verso');
    const recto = container.querySelector('.magazine-page.recto');
    const prev = container.querySelector('.magazine-booklet-arrow.prev');
    const next = container.querySelector('.magazine-booklet-arrow.next');
    const status = container.querySelector('.magazine-booklet-status');

    let spreadIndex = 0;
    const spreadCount = Math.ceil(imagePaths.length / 2);
    let animating = false;

    function render() {
      const leftIndex = spreadIndex * 2;
      const rightIndex = leftIndex + 1;
      const leftSrc = imagePaths[leftIndex] || '';
      const rightSrc = imagePaths[rightIndex] || '';

      verso.style.backgroundImage = leftSrc ? `url('${leftSrc}')` : '';
      recto.style.backgroundImage = rightSrc ? `url('${rightSrc}')` : '';
      verso.setAttribute('aria-label', leftSrc ? `${label} page ${leftIndex + 1}` : 'Blank verso');
      recto.setAttribute('aria-label', rightSrc ? `${label} page ${rightIndex + 1}` : 'Blank recto');

      prev.disabled = spreadIndex === 0;
      next.disabled = spreadIndex >= spreadCount - 1;

      const lastVisible = Math.min(rightIndex + 1, imagePaths.length);
      status.textContent = `Pages ${leftIndex + 1}–${lastVisible} of ${imagePaths.length}`;
    }

    function finishFlip(page, className, targetIndex) {
      page.classList.remove(className);
      page.style.transform = '';
      spreadIndex = targetIndex;
      animating = false;
      render();
    }

    next.addEventListener('click', () => {
      if (animating || spreadIndex >= spreadCount - 1) return;
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
  }

  initMainFlipbook();
  addMagazineBookStyles();
  initMagazineBooklet('miesBookGallery', 'Mies Book');
  initMagazineBooklet('sanaBookGallery', 'Sana Book');
});
