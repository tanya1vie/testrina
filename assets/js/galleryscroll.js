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
  const main = document.querySelector('main.main');
  const stages = Array.from(document.querySelectorAll('.draggable-card-stage'));
  if (!main || !stages.length) return;

  let topZ = 40;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const bringForward = card => { topZ += 1; card.style.zIndex = String(topZ); };

  stages.forEach((stage, stageIndex) => {
    const cards = Array.from(stage.querySelectorAll('.draggable-card'));
    if (!cards.length) return;

    let activePointerId = null;
    let activeCard = null;
    let startPointerX = 0;
    let startPointerY = 0;
    let startLeft = 0;
    let startTop = 0;
    let startRotation = 0;

    function placePile(){
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;

      cards.forEach((card, index) => {
        if (card.classList.contains('is-dragging')) return;
        const cardW = card.offsetWidth || 190;
        const cardH = card.offsetHeight || 260;
        const spreadX = Math.min(stageWidth * .22, 190);
        const spreadY = Math.min(stageHeight * .12, 54);
        const seed = index + stageIndex * 29;
        const xNoise = ((seed * 67) % 101) / 100 - .5;
        const yNoise = ((seed * 43) % 97) / 96 - .5;
        const left = clamp(stageWidth / 2 - cardW / 2 + xNoise * spreadX * 2, 0, Math.max(0, stageWidth - cardW));
        const top = clamp(stageHeight / 2 - cardH / 2 + yNoise * spreadY * 2, 0, Math.max(0, stageHeight - cardH));
        const rotation = ((seed * 17) % 33) - 16;
        card.style.left = `${left}px`;
        card.style.top = `${top}px`;
        card.dataset.rotation = String(rotation);
        card.style.transform = `rotate(${rotation}deg)`;
        card.style.zIndex = String(20 + index);
      });
    }

    cards.forEach(card => {
      card.addEventListener('pointerdown', event => {
        if (activePointerId !== null) return;
        activePointerId = event.pointerId;
        activeCard = card;
        bringForward(card);

        const rect = card.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        card.style.width = `${rect.width}px`;
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
          const rotation = startRotation + dx * .35;
          card.dataset.rotation = rotation.toFixed(1);
          card.style.transform = `rotate(${rotation}deg)`;
          return;
        }

        const maxLeft = Math.max(0, main.clientWidth - card.offsetWidth);
        const maxTop = Math.max(0, main.scrollHeight - card.offsetHeight);
        card.style.left = `${clamp(startLeft + dx, 0, maxLeft)}px`;
        card.style.top = `${clamp(startTop + dy, 0, maxTop)}px`;
      });

      function finishDrag(event){
        if (activePointerId !== event.pointerId || activeCard !== card) return;
        try { card.releasePointerCapture(event.pointerId); } catch (_) {}
        activePointerId = null;
        activeCard = null;
      }

      card.addEventListener('pointerup', finishDrag);
      card.addEventListener('pointercancel', finishDrag);
      card.addEventListener('click', () => bringForward(card));
      card.addEventListener('focus', () => bringForward(card));
    });

    requestAnimationFrame(placePile);
  });
})();