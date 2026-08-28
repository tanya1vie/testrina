(function () {
  function hideCeramicsWithoutCovers(root) {
    if ((document.title || '').trim().toLowerCase() !== 'ceramics gallery') return;

    const scope = root && root.querySelectorAll ? root : document;
    const cards = [];
    if (root && root.matches && root.matches('.gallery-grid .project-card')) cards.push(root);
    cards.push(...scope.querySelectorAll('.gallery-grid .project-card'));

    cards.forEach(card => {
      if (!card.querySelector('.project-link img')) card.remove();
    });
  }

  function projectName() {
    const projectTitle = document.querySelector('.project-title');
    if (projectTitle && projectTitle.textContent.trim()) return projectTitle.textContent.trim();

    const pageTitle = (document.title || '').split('|')[0].split('–')[0].trim();
    return pageTitle || 'Tatiana Estrina portfolio';
  }

  function titleCaseWords(value) {
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[+_\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => {
        if (/^(3d|vr|ar|ui|ux|pcb|cnc)$/i.test(word)) return word.toUpperCase();
        if (/^\d+$/.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  function generatedBookAlt(src) {
    const decoded = decodeURIComponent(src || '');
    const match = decoded.match(/-(\d+)\.jpe?g(?:\?.*)?$/i);
    const index = match ? Number(match[1]) + 1 : null;

    if (decoded.includes('/Thesis/TanyaBook/')) {
      return index ? `Architecture as Prosthesis thesis book page ${index}` : 'Architecture as Prosthesis thesis book page';
    }
    if (decoded.includes('/Thesis/MiesBook/')) {
      return index ? `Mies van der Rohe case-study booklet page ${index}` : 'Mies van der Rohe case-study booklet page';
    }
    if (decoded.includes('/Thesis/SanaBook/')) {
      return index ? `SANAA case-study booklet page ${index}` : 'SANAA case-study booklet page';
    }
    return '';
  }

  function descriptionFromSource(src) {
    if (!src) return '';

    const decoded = decodeURIComponent(src).replace(/\\/g, '/');
    const bookAlt = generatedBookAlt(decoded);
    if (bookAlt) return bookAlt;

    const file = decoded.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '');
    if (!file) return '';

    let name = file
      .replace(/\b(final|edited|combined|website|web|copy)\b/gi, ' ')
      .replace(/\bpage\b[_\s-]*(\d+)/gi, 'page $1')
      .replace(/\bimg[_\s-]*\d+\b/gi, 'project photograph')
      .replace(/\bdsc[_\s-]*\d+\b/gi, 'project photograph')
      .replace(/\bsam[_\s-]*\d+\b/gi, 'project photograph')
      .replace(/\buntitled[_\s-]*\d*(?:[_\s-]*\d+)?\b/gi, 'project image')
      .replace(/\bcapture\b/gi, 'project image')
      .replace(/\bscreenshot(?:[_\s-].*)?$/gi, 'software interface screenshot')
      .replace(/\brender\b/gi, 'architectural rendering')
      .replace(/\baxon(?:ometric)?\b/gi, 'axonometric drawing')
      .replace(/\bisometric\b/gi, 'isometric drawing')
      .replace(/\bperspective\b/gi, 'perspective drawing')
      .replace(/\bsectional\b/gi, 'sectional')
      .replace(/\belevation(?:s)?\b/gi, 'elevation drawing')
      .replace(/\bdiagram\b/gi, 'diagram')
      .replace(/\bplan\b/gi, 'plan')
      .replace(/\bconfiguration\b/gi, 'configuration')
      .replace(/\bphoto(?:graph)?\b/gi, 'photograph');

    name = titleCaseWords(name)
      .replace(/\b01\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!name || /^[\d\s]+$/.test(name)) return `${projectName()} project image`;
    return `${projectName()} — ${name}`;
  }

  function isPlaceholderAlt(alt) {
    const value = (alt || '').trim();
    if (!value) return true;

    return (
      /^(image|photo|project image|project photo)(\s*\d+)?$/i.test(value) ||
      /project image\s*\d*$/i.test(value) ||
      /thesis image\s*\d*$/i.test(value) ||
      /vela (interior|exterior)\s*\d*$/i.test(value) ||
      /yamal peninsula\s*-?\s*northern sea route/i.test(value) ||
      /drawing of the march[ée] du pont proposal/i.test(value) ||
      /^controller in use\s*\d+$/i.test(value) ||
      /^controller components$/i.test(value) ||
      /^zoomed image$/i.test(value)
    );
  }

  function improveAltText(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const images = [];

    if (root && root.tagName === 'IMG') images.push(root);
    images.push(...scope.querySelectorAll('img'));

    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (!src) {
        img.setAttribute('alt', '');
        return;
      }

      const current = img.getAttribute('alt');
      if (!isPlaceholderAlt(current)) return;

      const improved = descriptionFromSource(src);
      if (improved) img.setAttribute('alt', improved);
    });
  }

  function removeBackToTop(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const candidates = [];
    if (root && root.matches && root.matches('a, button')) candidates.push(root);
    candidates.push(...scope.querySelectorAll('a, button, [role="button"]'));

    candidates.forEach(el => {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
      const href = (el.getAttribute('href') || '').trim().toLowerCase();
      const className = typeof el.className === 'string' ? el.className.toLowerCase() : '';

      if (
        text === 'back to top' ||
        aria === 'back to top' ||
        className.includes('back-to-top') ||
        className.includes('backtotop') ||
        (href === '#top' && /top/.test(text || aria))
      ) {
        el.remove();
      }
    });
  }

  function runAccessibilityCleanup(root) {
    hideCeramicsWithoutCovers(root);
    improveAltText(root);
    removeBackToTop(root);
  }

  runAccessibilityCleanup(document);

  if (document.body && 'MutationObserver' in window) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) runAccessibilityCleanup(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();

(function () {
  if (
    'ontouchstart' in window ||
    (window.navigator && window.navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  ) {
    return;
  }

  let cursor = document.getElementById('customCursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'customCursor';
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
  } else {
    document.body.appendChild(cursor);
  }

  const CLICKABLE = [
    'a',
    'button',
    '[role="button"]',
    'input',
    'select',
    'textarea',
    'label',
    '.project-link',
    '[data-clickable="true"]',
    '.puzzle-bubble'
  ].join(',');

  function isClickable(el) {
    while (el && el !== document.body) {
      if (el.matches && el.matches(CLICKABLE)) return true;
      el = el.parentElement;
    }
    return false;
  }

  const BASE_SIZE = 10;
  const SCALE_NORMAL = 1;
  const SCALE_CLICKABLE = 3;

  function clamp(v, min, max){
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('mousemove', (e) => {
    cursor.classList.remove('is-hidden');
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const clickable = isClickable(el);
    cursor.classList.toggle('is-clickable', clickable);
    const scale = clickable ? SCALE_CLICKABLE : SCALE_NORMAL;
    const r = (BASE_SIZE / 2) * scale;
    const x = clamp(e.clientX, r, window.innerWidth - r);
    const y = clamp(e.clientY, r, window.innerHeight - r);
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
  });

  document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));
})();