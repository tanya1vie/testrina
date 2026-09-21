(() => {
  const root = document.documentElement;
  root.classList.add('site-loading');

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    root.classList.remove('site-loading');
    root.classList.add('site-loaded');
  };

  if (document.readyState === 'complete') {
    requestAnimationFrame(reveal);
  } else {
    window.addEventListener('load', reveal, { once: true });
  }

  // Prevent a failed third-party request from leaving the site hidden forever.
  window.setTimeout(reveal, 12000);
})();
