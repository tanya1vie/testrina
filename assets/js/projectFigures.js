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

    return output.charAt(0).toUpperCase() + output.slice(1);
  }

  function captionSourceFor(media) {
    return media.matches('.video-wrapper')
      ? media.querySelector(':scope > iframe')
      : media;
  }

  function existingCaptionFor(media, figure) {
    const source = captionSourceFor(media);
    if (media.dataset.caption) return stripProjectName(media.dataset.caption);
    if (source?.dataset.caption) return stripProjectName(source.dataset.caption);

    const existingFigcaption = figure && figure.querySelector(':scope > figcaption');
    if (existingFigcaption && existingFigcaption.textContent.trim()) {
      return stripProjectName(existingFigcaption.textContent);
    }

    const sibling = figure ? figure.nextElementSibling : media.nextElementSibling;
    if (sibling && sibling.matches('.imageSubtitle, .image-subtitle, .image-caption, .project-image-caption')) {
      const text = stripProjectName(sibling.textContent);
      sibling.remove();
      if (text) return text;
    }

    const sourceAlt = source?.querySelector?.('source[alt]')?.getAttribute('alt') || '';
    return stripProjectName(
      source?.getAttribute('alt') ||
      source?.getAttribute('aria-label') ||
      source?.getAttribute('title') ||
      sourceAlt
    );
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
      figure.classList.remove(
        'auto-project-pair-left',
        'auto-project-pair-right',
        'auto-project-paired',
        'caption-side-left',
        'caption-side-right'
      );
    });
    main.querySelectorAll('.auto-project-pair-parent').forEach((parent) => {
      parent.classList.remove('auto-project-pair-parent', 'caption-side-left', 'caption-side-right');
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
      const figures = Array.from(parent.children)
        .filter((child) => child.classList?.contains('auto-project-figure'));
      if (figures.length < 2) return;

      const positioned = figures
        .map((figure) => ({ figure, rect: figure.getBoundingClientRect() }))
        .sort((a, b) => Math.abs(a.rect.top - b.rect.top) < 24
          ? a.rect.left - b.rect.left
          : a.rect.top - b.rect.top);

      const rows = [];
      positioned.forEach((item) => {
        const row = rows.find((candidate) => Math.abs(candidate.top - item.rect.top) < 24);
        if (row) {
          row.items.push(item);
        } else {
          rows.push({ top: item.rect.top, items: [item] });
        }
      });

      const pairs = rows
        .map((row) => ({
          top: row.top,
          items: row.items.sort((a, b) => a.rect.left - b.rect.left)
        }))
        .filter((row) =>
          row.items.length === 2 &&
          row.items[1].rect.left > row.items[0].rect.left + 8
        );

      if (!pairs.length) return;

      const side = captionSideFor(parent);
      parent.classList.add('auto-project-pair-parent', `caption-side-${side}`);

      const parentRect = parent.getBoundingClientRect();

      pairs.forEach((row) => {
        const [left, right] = row.items.map((item) => item.figure);
        left.classList.add('auto-project-paired', 'auto-project-pair-left');
        right.classList.add('auto-project-paired', 'auto-project-pair-right');

        /* For the shared project-image-pair layout, size each figure by the
           image or video's natural aspect ratio. With flex-grow set to that
           ratio, both media items fill the row together at the same height. */
        if (parent.classList.contains('project-image-pair')) {
          [left, right].forEach((figure) => {
            const media = figure.querySelector(':scope > img, :scope > video');
            if (!media) return;

            const applyAspect = () => {
              const width = media.matches('video') ? media.videoWidth : media.naturalWidth;
              const height = media.matches('video') ? media.videoHeight : media.naturalHeight;
              if (width && height) {
                figure.style.setProperty('--pair-aspect', String(width / height));
              }
            };

            applyAspect();
            if (media.matches('video') && media.readyState < 1) {
              media.addEventListener('loadedmetadata', applyAspect, { once: true });
            } else if (media.matches('img') && !media.complete) {
              media.addEventListener('load', applyAspect, { once: true });
            }
          });
        }

        const column = document.createElement('div');
        column.className = 'auto-project-pair-caption-column';
        column.setAttribute('aria-label', 'Figure captions');
        column.style.top = `${Math.max(0, row.top - parentRect.top)}px`;

        [left, right].forEach((figure) => {
          const caption = figure.querySelector(':scope > .auto-project-caption');
          if (!caption) return;
          const copy = caption.cloneNode(true);
          copy.classList.add('auto-project-pair-caption');
          column.appendChild(copy);
        });

        parent.appendChild(column);
      });
    });
  }

  function refreshProjectFigures() {
    const seen = new Set();
    const mediaItems = Array.from(main.querySelectorAll('img, video, iframe'))
      .map((media) => media.matches('iframe') && media.closest('.video-wrapper')
        ? media.closest('.video-wrapper')
        : media)
      .filter((media) => {
        if (seen.has(media)) return false;
        seen.add(media);

        const source = captionSourceFor(media);
        if (media.matches('[data-no-figure-caption]') || source?.matches('[data-no-figure-caption]')) return false;
        if (media.closest('.draggable-card, .draggable-card-stage, .draggable-card-section')) return false;
        if (media.closest('.lightbox, .modal, template')) return false;
        if (media.closest('[style*="display:none"], [style*="display: none"]')) return false;
        return true;
      });

    mediaItems.forEach((media, index) => {
      let figure = media.closest('figure');
      const description = existingCaptionFor(media, figure);

      if (!figure || !figure.contains(media)) {
        figure = document.createElement('figure');
        figure.className = 'auto-project-figure';
        media.parentNode.insertBefore(figure, media);
        figure.appendChild(media);
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

  function ensureProjectImageLightbox() {
    let lightbox = document.getElementById('projectImageLightbox');
    if (lightbox) return lightbox;

    lightbox = document.createElement('div');
    lightbox.id = 'projectImageLightbox';
    lightbox.className = 'project-image-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <button type="button" class="project-image-lightbox-close" aria-label="Close full screen image">×</button>
      <img class="project-image-lightbox-image" alt="">
    `;
    document.body.appendChild(lightbox);

    const close = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('project-image-lightbox-open');
      const image = lightbox.querySelector('.project-image-lightbox-image');
      image.removeAttribute('src');
      image.alt = '';
    };

    lightbox.querySelector('.project-image-lightbox-close').addEventListener('click', close);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('is-open')) close();
    });

    lightbox._closeProjectImageLightbox = close;
    return lightbox;
  }

  function openProjectImageLightbox(img) {
    const lightbox = ensureProjectImageLightbox();
    const image = lightbox.querySelector('.project-image-lightbox-image');
    image.src = img.currentSrc || img.src;
    image.alt = img.alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('project-image-lightbox-open');
    lightbox.querySelector('.project-image-lightbox-close').focus();
  }

  /* Make project imagery clickable without changing the markup on every page.
     Existing dedicated gallery lightboxes keep handling their own gallery. */
  main.addEventListener('click', (event) => {
    const img = event.target.closest('img');
    if (!img || !main.contains(img)) return;
    if (img.closest('a, button, .draggable-card')) return;
    if (img.matches('[data-no-image-lightbox]')) return;
    if (img.closest('.gallery') && document.getElementById('lightbox')) return;

    event.preventDefault();
    openProjectImageLightbox(img);
  });

  main.querySelectorAll('img').forEach((img) => {
    if (!img.closest('a, button, .draggable-card') && !img.matches('[data-no-image-lightbox]')) {
      img.classList.add('project-image-lightbox-trigger');
    }
  });

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
        (node.matches?.('img, video, iframe') || node.querySelector?.('img, video, iframe'))
      )
    );
    if (changed) refreshProjectFigures();
  });

  observer.observe(main, { childList: true, subtree: true });
})();
