(function () {
  const main = document.querySelector('main');
  if (!main || !main.querySelector('.project-header')) return;

  if (!document.querySelector('link[data-project-captions]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'assets/css/projectCaptions.css';
    stylesheet.dataset.projectCaptions = 'true';
    document.head.appendChild(stylesheet);
  }

  const stripFigureNumber = (text) => (text || '')
    .replace(/^\s*fig(?:ure)?\.?\s*\d+\s*[.:\-]?\s*/i, '')
    .trim();

  const normalizeSpaces = (text) => (text || '').replace(/\s+/g, ' ').trim();

  function projectNameAliases() {
    const title = normalizeSpaces(main.querySelector('.project-title')?.textContent || '');
    if (!title) return [];

    const aliases = new Set([title]);
    aliases.add(title.replace(/[–—:|]/g, ' '));
    aliases.add(title.replace(/\b\d+(?:\.\d+)?\b/g, ' '));

    const compact = title
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9]+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (compact) aliases.add(compact);

    return Array.from(aliases)
      .map(normalizeSpaces)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
  }

  const titleAliases = projectNameAliases();

  function stripProjectName(text) {
    let output = normalizeSpaces(stripFigureNumber(text));
    if (!output) return '';

    for (const alias of titleAliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`^${escaped}(?:\\s*[-–—:|,]\\s*|\\s+)`, 'i');
      if (pattern.test(output)) {
        output = output.replace(pattern, '').trim();
        break;
      }
    }

    return output.charAt(0).toLowerCase() + output.slice(1);
  }

  function existingCaptionFor(img, figure) {
    if (img.dataset.caption) return stripProjectName(img.dataset.caption);

    const existingFigcaption = figure && figure.querySelector(':scope > figcaption');
    if (existingFigcaption && existingFigcaption.textContent.trim()) {
      return stripProjectName(existingFigcaption.textContent);
    }

    const sibling = figure ? figure.nextElementSibling : img.nextElementSibling;
    if (sibling && sibling.matches('.imageSubtitle, .image-subtitle, .image-caption, .project-image-caption')) {
      const text = stripProjectName(sibling.textContent);
      sibling.remove();
      if (text) return text;
    }

    return stripProjectName(img.getAttribute('alt') || '');
  }

  function setCaptionContent(caption, number, description) {
    caption.replaceChildren();

    const label = document.createElement('strong');
    label.className = 'auto-project-caption-label';
    label.textContent = `fig ${number}.`;
    caption.appendChild(label);

    if (description) caption.appendChild(document.createTextNode(` ${description}`));
  }

  function captionSideFor(element) {
    const local = element.closest('[data-caption-side]')?.dataset.captionSide;
    const page = main.dataset.captionSide;
    return (local || page || 'right').toLowerCase() === 'left' ? 'left' : 'right';
  }

  function clearPairClasses() {
    main.querySelectorAll('.auto-project-figure').forEach((figure) => {
      figure.classList.remove('auto-project-pair-left', 'auto-project-pair-right', 'caption-side-left', 'caption-side-right');
    });
    main.querySelectorAll('.auto-project-pair-row').forEach((parent) => {
      parent.classList.remove('auto-project-pair-row', 'caption-side-left', 'caption-side-right');
    });
    main.querySelectorAll('.auto-project-pair-caption-column').forEach((column) => column.remove());
  }

  function markSideBySidePairs() {
    clearPairClasses();

    main.querySelectorAll('.auto-project-figure').forEach((figure) => {
      figure.classList.add(`caption-side-${captionSideFor(figure)}`);
    });

    const parents = new Set();
    main.querySelectorAll('.auto-project-figure').forEach((figure) => {
      if (figure.parentElement) parents.add(figure.parentElement);
    });

    parents.forEach((parent) => {
      const figures = Array.from(parent.children).filter((child) => child.classList?.contains('auto-project-figure'));
      if (figures.length !== 2) return;

      const firstRect = figures[0].getBoundingClientRect();
      const secondRect = figures[1].getBoundingClientRect();
      const sameRow = Math.abs(firstRect.top - secondRect.top) < 24 && secondRect.left > firstRect.left;
      if (!sameRow) return;

      const side = captionSideFor(parent);
      parent.classList.add('auto-project-pair-row', `caption-side-${side}`);
      figures[0].classList.add('auto-project-pair-left');
      figures[1].classList.add('auto-project-pair-right');

      const column = document.createElement('div');
      column.className = 'auto-project-pair-caption-column';
      column.setAttribute('aria-label', 'Figure captions');

      figures.forEach((figure) => {
        const caption = figure.querySelector(':scope > .auto-project-caption');
        if (!caption) return;
        const copy = caption.cloneNode(true);
        copy.classList.add('auto-project-pair-caption');
        column.appendChild(copy);
      });

      parent.appendChild(column);
    });
  }

  function refreshProjectFigures() {
    const images = Array.from(main.querySelectorAll('img')).filter((img) => {
      if (img.matches('[data-no-figure-caption]')) return false;
      if (img.closest('.draggable-card, .draggable-card-stage, .draggable-card-section')) return false;
      if (img.closest('.lightbox, .modal, template')) return false;
      if (img.closest('[style*="display:none"], [style*="display: none"]')) return false;
      return true;
    });

    images.forEach((img, index) => {
      let figure = img.closest('figure');
      const description = existingCaptionFor(img, figure);

      if (!figure || !figure.contains(img)) {
        figure = document.createElement('figure');
        figure.className = 'auto-project-figure';
        img.parentNode.insertBefore(figure, img);
        figure.appendChild(img);
      } else {
        figure.classList.add('auto-project-figure');
      }

      let caption = figure.querySelector(':scope > figcaption');
      if (!caption) {
        caption = document.createElement('figcaption');
        figure.appendChild(caption);
      }

      caption.classList.add('auto-project-caption');
      setCaptionContent(caption, index + 1, description);
    });

    requestAnimationFrame(markSideBySidePairs);
  }

  refreshProjectFigures();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(markSideBySidePairs, 100);
  });

  const observer = new MutationObserver((mutations) => {
    const changed = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some((node) =>
        node.nodeType === 1 &&
        !node.classList?.contains('auto-project-caption') &&
        !node.classList?.contains('auto-project-pair-caption-column') &&
        (node.matches?.('img') || node.querySelector?.('img'))
      )
    );
    if (changed) refreshProjectFigures();
  });

  observer.observe(main, { childList: true, subtree: true });
})();
