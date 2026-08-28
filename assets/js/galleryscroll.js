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
    .strategy-card-section { width: 100%; margin: 80px 0 500px; position: relative; z-index: 1; pointer-events: none; }
    .strategy-card-heading, .strategy-card-instructions { pointer-events: auto; }
    .strategy-card-heading { margin-bottom: 8px; }
    .strategy-card-instructions { max-width: 720px; margin: 0; opacity: 0.7; }
    .strategy-card { position: absolute; width: clamp(150px, 19vw, 230px); aspect-ratio: 2 / 3; padding: 0; margin: 0; border: 0; outline: 0; background: transparent; box-shadow: 0 8px 22px rgba(0,0,0,0.18); cursor: grab; user-select: none; touch-action: none; transform-origin: center center; will-change: left, top, transform; z-index: 20; }
    .strategy-card:active { cursor: grabbing; }
    .strategy-card:focus-visible { box-shadow: 0 12px 30px rgba(0,0,0,0.28); }
    .strategy-card img { display: block; width: 100%; height: 100%; margin: 0; object-fit: cover; pointer-events: none; }
    @media (max-width: 700px) { .strategy-card-section { margin: 56px 0 420px; } .strategy-card { width: clamp(125px, 38vw, 185px); } }
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'strategy-card-section';
  section.innerHTML = `<h2 class="strategy-card-heading">STRATEGY CARDS</h2><p class="strategy-card-instructions">Drag the strategy cards anywhere across the thesis page. Click or tap a card to bring it forward. Hold Shift while dragging to rotate it.</p>`;

  const flipbook = document.getElementById('flipbookWrap');
  const projectImages = document.querySelector('.project-images');
  if (flipbook && flipbook.parentNode) flipbook.parentNode.insertBefore(section, flipbook);
  else if (projectImages) projectImages.appendChild(section);
  else return;

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

  function placeInitialCards() {
    const sectionTop = section.offsetTop;
    const mainWidth = main.clientWidth;
    const centerX = mainWidth / 2;
    const centerY = sectionTop + 245;

    main.querySelectorAll('.strategy-card').forEach((card, index) => {
      const angle = (index / filenames.length) * Math.PI * 2;
      const ringX = Math.min(mainWidth * 0.27, 220) + (index % 4) * 10;
      const ringY = 105 + (index % 5) * 10;
      const cardW = card.offsetWidth || 190;
      const cardH = card.offsetHeight || 285;
      const left = clamp(centerX + Math.cos(angle) * ringX - cardW / 2, 0, Math.max(0, mainWidth - cardW));
      const top = Math.max(0, centerY + Math.sin(angle) * ringY - cardH / 2);
      const rotation = ((index * 17) % 31) - 15;
      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      card.dataset.rotation = String(rotation);
      card.style.transform = `rotate(${rotation}deg)`;
      card.style.zIndex = String(20 + index);
    });
  }

  filenames.forEach((filename, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'strategy-card';
    card.setAttribute('aria-label', `Architecture strategy card ${index + 1}`);
    card.innerHTML = `<img src="Images/Thesis/Playing%20Cards/${filename}" alt="Architecture strategy card ${index + 1}" draggable="false" loading="lazy">`;

    card.addEventListener('pointerdown', event => {
      if (activePointerId !== null) return;
      activePointerId = event.pointerId;
      activeCard = card;
      bringForward(card);
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
    main.appendChild(card);
  });

  requestAnimationFrame(placeInitialCards);
})();
