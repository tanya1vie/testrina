(function(){
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  let animating = false;

  function easeInOutCubic(t){
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  }

  function getStep(){
    const first = gallery.querySelector('.gallery-item');
    if(!first) return gallery.clientWidth * 0.9;
    const rect = first.getBoundingClientRect();
    const style = getComputedStyle(gallery);
    const gap = parseFloat(style.gap || 20);
    return rect.width + gap;
  }

  window.scrollGallery = function(dir){
    if (animating) return;
    animating = true;
    const start = gallery.scrollLeft;
    const target = start + getStep() * (dir || 1);
    const duration = 700;
    const t0 = performance.now();

    function frame(now){
      const p = Math.min(1, (now - t0) / duration);
      gallery.scrollLeft = start + (target - start) * easeInOutCubic(p);
      if (p < 1) requestAnimationFrame(frame);
      else animating = false;
    }
    requestAnimationFrame(frame);
  };

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCloseBtn = document.getElementById('lightboxClose');

  function sizeImage75(){
    if (!lbImg) return;
    const nw = lbImg.naturalWidth || 0;
    const nh = lbImg.naturalHeight || 0;
    if (!nw || !nh) return;
    const targetW = nw * 0.95;
    const targetH = nh * 0.95;
    const maxW = window.innerWidth * 0.95;
    const maxH = window.innerHeight * 0.90;
    const scale = Math.min(maxW / targetW, maxH / targetH, 1);
    lbImg.style.width = (targetW * scale) + 'px';
    lbImg.style.height = 'auto';
  }

  function openLightbox(src, alt){
    if (!lightbox || !lbImg) return;
    lbImg.style.width = '';
    lbImg.style.height = '';
    lbImg.onload = () => sizeImage75();
    lbImg.src = src;
    lbImg.alt = alt || '';
    document.body.style.overflow = 'hidden';
    lightbox.style.display = 'flex';
  }

  function closeLightbox(){
    if (!lightbox || !lbImg) return;
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    lbImg.style.width = '';
    lbImg.style.height = '';
  }

  gallery.addEventListener('click', (e)=>{
    const img = e.target.closest('.gallery-item img');
    if (!img) return;
    openLightbox(img.src, img.alt);
  });

  if (lbCloseBtn && lightbox && lbImg) {
    lbCloseBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });
  }

  window.addEventListener('resize', ()=>{
    if (lightbox && lbImg && lightbox.style.display === 'flex' && lbImg.complete) sizeImage75();
  });
})();

(function(){
  const title = document.querySelector('.project-title');
  const main = document.querySelector('main.main');
  if (!title || !main || !title.textContent.includes('ARCHITECTURE AS PROSTHESIS')) return;
  if (document.querySelector('.strategy-card-section')) return;

  const filenames = [
    'cards-2.jpg', 'cards-22.jpg', 'cards-23.jpg', 'cards-24.jpg', 'cards-25.jpg',
    'cards-26.jpg', 'cards-27.jpg', 'cards-28.jpg', 'cards-29.jpg', 'cards-3.jpg',
    'cards-32.jpg', 'cards-33.jpg', 'cards-34.jpg', 'cards-35.jpg', 'cards-36.jpg',
    'cards-37.jpg', 'cards-38.jpg', 'cards-39.jpg'
  ];

  const style = document.createElement('style');
  style.textContent = `
    main.main { position: relative; }
    .strategy-card-section { width: 100%; margin: 80px 0 40px; position: relative; z-index: 1; }
    .strategy-card-heading { margin-bottom: 8px; }
    .strategy-card-instructions { max-width: 720px; margin: 0 0 28px; opacity: 0.7; }
    .strategy-card-stage { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); align-items: start; gap: 22px; width: 100%; }
    .strategy-card { position: relative; width: 100%; max-width: 230px; height: auto; padding: 0; margin: 0; border: 0; outline: 0; background: transparent; box-shadow: 0 8px 22px rgba(0,0,0,0.18); cursor: grab; user-select: none; touch-action: none; transform-origin: center center; will-change: transform; z-index: 20; justify-self: start; }
    .strategy-card:active { cursor: grabbing; }
    .strategy-card:focus-visible { box-shadow: 0 12px 30px rgba(0,0,0,0.28); }
    .strategy-card img { display: block; width: 100%; height: auto; margin: 0; object-fit: contain; pointer-events: none; }
    .strategy-card.is-dragging { position: absolute; width: clamp(150px, 19vw, 230px); max-width: none; z-index: 60; }
    @media (max-width: 700px) {
      .strategy-card-section { margin-top: 56px; }
      .strategy-card-stage { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .strategy-card { max-width: none; }
      .strategy-card.is-dragging { width: clamp(125px, 38vw, 185px); }
    }
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'strategy-card-section';
  section.innerHTML = `<h2 class="strategy-card-heading">STRATEGY CARDS</h2><p class="strategy-card-instructions">Drag the strategy cards anywhere across the thesis page. Click or tap a card to bring it forward. Hold Shift while dragging to rotate it.</p><div class="strategy-card-stage"></div>`;

  const flipbook = document.getElementById('flipbookWrap');
  const projectImages = document.querySelector('.project-images');
  if (flipbook && flipbook.parentNode) flipbook.parentNode.insertBefore(section, flipbook);
  else if (projectImages) projectImages.appendChild(section);
  else return;

  const stage = section.querySelector('.strategy-card-stage');
  let topZ = 40;
  let activePointerId = null;
  let activeCard = null;
  let startPointerX = 0;
  let startPointerY = 0;
  let startLeft = 0;
  let startTop = 0;
  let startRotation = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const bringForward = card => { topZ += 1; card.style.zIndex = String(topZ); };

  filenames.forEach((filename, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'strategy-card';
    card.setAttribute('aria-label', `Architecture strategy card ${index + 1}`);
    card.dataset.rotation = '0';
    card.innerHTML = `<img src="Images/Thesis/Playing%20Cards/${filename}" alt="Architecture strategy card ${index + 1}" draggable="false" loading="lazy">`;

    card.addEventListener('pointerdown', event => {
      if (activePointerId !== null) return;
      activePointerId = event.pointerId;
      activeCard = card;
      bringForward(card);

      const rect = card.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      const renderedWidth = rect.width;

      card.style.width = `${renderedWidth}px`;
      card.classList.add('is-dragging');
      main.appendChild(card);
      card.style.left = `${rect.left - mainRect.left + main.scrollLeft}px`;
      card.style.top = `${rect.top - mainRect.top + main.scrollTop}px`;

      startPointerX = event.clientX;
      startPointerY = event.clientY;
      startLeft = parseFloat(card.style.left) || 0;
      startTop = parseFloat(card.style.top) || 0;
      startRotation = parseFloat(card.dataset.rotation) || 0;
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener('pointermove', event => {
      if (activePointerId !== event.pointerId || activeCard !== card) return;
      const dx = event.clientX - startPointerX;
      const dy = event.clientY - startPointerY;
      if (event.shiftKey) {
        const rotation = startRotation + dx * 0.35;
        card.dataset.rotation = rotation.toFixed(1);
        card.style.transform = `rotate(${rotation}deg)`;
        return;
      }
      const maxLeft = Math.max(0, main.clientWidth - card.offsetWidth);
      const maxTop = Math.max(0, main.scrollHeight - card.offsetHeight);
      card.style.left = `${clamp(startLeft + dx, 0, maxLeft)}px`;
      card.style.top = `${clamp(startTop + dy, 0, maxTop)}px`;
    });

    function finishDrag(event) {
      if (activePointerId !== event.pointerId || activeCard !== card) return;
      try { card.releasePointerCapture(event.pointerId); } catch (_) {}
      activePointerId = null;
      activeCard = null;
    }

    card.addEventListener('pointerup', finishDrag);
    card.addEventListener('pointercancel', finishDrag);
    card.addEventListener('click', () => bringForward(card));
    card.addEventListener('focus', () => bringForward(card));
    stage.appendChild(card);
  });
})();
