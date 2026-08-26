(function () {
  // 🔴 Skip custom cursor on mobile / touch / coarse-pointer devices
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
    '.puzzle-bubble'   // SVG bubbles
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
    cursor.style.top  = y + 'px';
  });

  document.addEventListener('mouseleave', () =>
    cursor.classList.add('is-hidden')
  );

  document.addEventListener('mouseenter', () =>
    cursor.classList.remove('is-hidden')
  );
})();
