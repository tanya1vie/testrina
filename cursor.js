// cursor.js
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  const CLICKABLE = [
    'a','button','[role="button"]','input','select','textarea','label',
    '.clickable','.gallery-item','.gallery-item img','[data-clickable="true"]'
  ].join(',');

  function isClickable(el){
    while (el && el !== document.body) {
      if (el.matches?.(CLICKABLE)) return true;
      el = el.parentElement;
    }
    return false;
  }

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    cursor.classList.toggle('is-clickable', isClickable(el));
    cursor.classList.remove('is-hidden');
  });

  document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));
});
