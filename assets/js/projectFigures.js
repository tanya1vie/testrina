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

  function refreshProjectFigures() {
    const images = Array.from(main.querySelectorAll('img')).filter((img) => {
      if (img.matches('[data-no-figure-caption]')) return false;
      if (img.closest('.lightbox, .modal, template')) return false;
      if (img.closest('[style*="display:none"], [style*="display: none"]')) return false;
      return true;
    });

    images.forEach((img, index) => {
      const label = `fig ${index + 1}.`;
      let figure = img.closest('figure');

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

      const description = img.dataset.caption || img.getAttribute('alt') || '';
      caption.classList.add('auto-project-caption');
      caption.textContent = description ? `${label} ${description}` : label;
    });
  }

  refreshProjectFigures();

  const observer = new MutationObserver((mutations) => {
    const changed = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some((node) =>
        node.nodeType === 1 && (node.matches?.('img') || node.querySelector?.('img'))
      )
    );
    if (changed) refreshProjectFigures();
  });

  observer.observe(main, { childList: true, subtree: true });
})();
