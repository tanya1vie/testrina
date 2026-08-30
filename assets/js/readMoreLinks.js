(function () {
  function isExternalReadLink(link) {
    if (!link || link.tagName !== 'A') return false;
    const href = (link.getAttribute('href') || '').trim();
    const text = (link.textContent || '').replace(/\s+/g, ' ').trim();
    return /^https?:\/\//i.test(href) && /(read|learn|article|more|press|feature)/i.test(text);
  }

  function labelFor(link) {
    const raw = (link.textContent || '').replace(/\s+/g, ' ').trim();
    const cleaned = raw
      .replace(/^read\s+(more\s+)?(about\s+it\s+)?(at|on|in|here)\s+/i, '')
      .replace(/^learn\s+more\s+(at|on|here)\s+/i, '')
      .replace(/^read\s+(the\s+)?(article|feature)\s+(at|on|here)\s*/i, '')
      .replace(/^read\s+(about\s+it|more|here)\s*$/i, '')
      .trim();

    if (cleaned) return cleaned;

    try {
      return new URL(link.href).hostname.replace(/^www\./, '').split('.')[0]
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase());
    } catch (_) {
      return 'link';
    }
  }

  function convertContainer(container) {
    if (!container || container.dataset.readMoreConverted === 'true') return;

    const links = Array.from(container.querySelectorAll('a.button')).filter(isExternalReadLink);
    if (!links.length) return;

    const paragraph = document.createElement('p');
    paragraph.className = 'project-description project-read-more';
    paragraph.append(document.createTextNode('Read more at '));

    links.forEach((link, index) => {
      const replacement = document.createElement('a');
      replacement.className = 'text-link';
      replacement.href = link.href;
      replacement.textContent = labelFor(link);
      if (link.target) replacement.target = link.target;
      replacement.rel = link.rel || 'noopener noreferrer';

      if (index > 0) {
        paragraph.append(document.createTextNode(index === links.length - 1 ? ' and ' : ', '));
      }
      paragraph.append(replacement);
    });

    paragraph.append(document.createTextNode('.'));
    container.dataset.readMoreConverted = 'true';
    container.replaceWith(paragraph);
  }

  function normalizeReadMoreButtons(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const containers = [];

    if (root && root.matches && root.matches('.button-container, .button-row')) containers.push(root);
    containers.push(...scope.querySelectorAll('.button-container, .button-row'));

    containers.forEach(convertContainer);
  }

  normalizeReadMoreButtons(document);

  if (document.body && 'MutationObserver' in window) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) normalizeReadMoreButtons(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
