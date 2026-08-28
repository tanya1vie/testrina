(function(){
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  let animating = false;

  // Ease-in-out cubic
  function easeInOutCubic(t){
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  }

  // Amount to scroll per click: one card + gap
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
    const duration = 700; // ms
    const t0 = performance.now();

    function frame(now){
      const p = Math.min(1, (now - t0) / duration);
      const eased = easeInOutCubic(p); // accelerate then ease out
      gallery.scrollLeft = start + (target - start) * eased;
      if (p < 1) requestAnimationFrame(frame);
      else animating = false;
    }
    requestAnimationFrame(frame);
  };

  // --- Lightbox ---
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lightboxImg');
  const lbCloseBtn = document.getElementById('lightboxClose');

  function sizeImage75(){
    if (!lbImg) return;
    // 75% of the image's intrinsic size, clamped to viewport
    const nw = lbImg.naturalWidth  || 0;
    const nh = lbImg.naturalHeight || 0;
    if (!nw || !nh) return;

    const targetW = nw * 0.95;
    const targetH = nh * 0.95;


    const maxW = window.innerWidth  * 0.95;
    const maxH = window.innerHeight * 0.90;

    // If 75% would overflow the viewport, scale it down proportionally
    const scale = Math.min(maxW / targetW, maxH / targetH, 1);

    lbImg.style.width  = (targetW * scale) + 'px';
    lbImg.style.height = 'auto';               // preserve aspect ratio
  }

  function openLightbox(src, alt){
    if (!lightbox || !lbImg) return;
    lbImg.style.width = '';                    // reset any previous sizing
    lbImg.style.height = '';

    lbImg.onload = () => sizeImage75();        // size after intrinsic dims are known
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
    lbImg.style.width = '';                    // cleanup
    lbImg.style.height = '';
  }

  // Open when clicking any gallery image
  gallery.addEventListener('click', (e)=>{
    const img = e.target.closest('.gallery-item img');
    if (!img) return;
    openLightbox(img.src, img.alt);
  });

  // Close interactions
  if (lbCloseBtn && lightbox && lbImg) {
    lbCloseBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });
  }

  // Re-clamp on resize (keeps 75% sizing within viewport)
  window.addEventListener('resize', ()=>{
    if (lightbox && lbImg && lightbox.style.display === 'flex' && lbImg.complete) sizeImage75();
  });
})();

(function(){
  if (!document.body || !document.querySelector('.project-title')) return;
  if (document.querySelector('.strategy-card-section')) return;
  if (!document.querySelector('.project-title').textContent.includes('ARCHITECTURE AS PROSTHESIS')) return;

  const filenames = [
    'cards-2.jpg',
    'cards-22.jpg',
    'cards-23.jpg',
    'cards-24.jpg',
    'cards-25.jpg',
    'cards-26.jpg',
    'cards-27.jpg',
    'cards-28.jpg',
    'cards-29.jpg',
    'cards-3.jpg',
    'cards-32.jpg',
    'cards-33.jpg',
    'cards-34.jpg',
    'cards-35.jpg',
    'cards-36.jpg',
    'cards-37.jpg',
    'cards-38.jpg',
    'cards-39.jpg'
  ];

  const style = document.createElement('style');
  style.textContent = `
    .strategy-card-section {
      margin: 80px 0 90px;
    }

    .strategy-card-heading {
      margin-bottom: 10px;
    }

    .strategy-card-instructions {
      max-width: 720px;
      margin: 0 0 18px;
      opacity: 0.72;
    }

    .strategy-card-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 18px;
    }

    .strategy-card-controls button {
      appearance: none;
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      padding: 9px 14px;
      font: inherit;
      cursor: pointer;
    }

    .strategy-card-controls button:hover,
    .strategy-card-controls button:focus-visible {
      background: currentColor;
      color: white;
      outline: none;
    }

    .strategy-card-pile {
      position: relative;
      width: 100%;
      height: 650px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.12);
      background:
        radial-gradient(circle at 18% 22%, rgba(0,0,0,0.025), transparent 30%),
        radial-gradient(circle at 82% 75%, rgba(0,0,0,0.025), transparent 32%);
      touch-action: pan-y;
    }

    .strategy-card {
      position: absolute;
      width: clamp(155px, 22vw, 245px);
      aspect-ratio: 2 / 3;
      left: 50%;
      top: 50%;
      padding: 0;
      border: 0;
      background: white;
      box-shadow: 0 8px 22px rgba(0,0,0,0.18);
      cursor: grab;
      user-select: none;
      transform-origin: center center;
      transition: box-shadow 160ms ease;
      will-change: transform;
    }

    .strategy-card:active {
      cursor: grabbing;
    }

    .strategy-card.is-selected {
      box-shadow: 0 14px 32px rgba(0,0,0,0.28);
      outline: 2px solid currentColor;
      outline-offset: 3px;
    }

    .strategy-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
    }

    .strategy-card-status {
      margin-top: 12px;
      min-height: 1.4em;
      opacity: 0.7;
      font-size: 0.9rem;
    }

    @media (max-width: 700px) {
      .strategy-card-section {
        margin: 56px 0 70px;
      }

      .strategy-card-pile {
        height: 520px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .strategy-card,
      .strategy-card-controls button {
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'strategy-card-section';
  section.innerHTML = `
    <h2 class="strategy-card-heading">STRATEGY CARDS</h2>
    <p class="strategy-card-instructions">Pick up the cards, toss them around the table, and bring different strategies to the front. Click or tap a card to select it, then drag to move it. Use the controls to rotate, shuffle, or cycle the pile.</p>
    <div class="strategy-card-controls" aria-label="Strategy card controls">
      <button type="button" data-action="shuffle">Shuffle pile</button>
      <button type="button" data-action="next">Bring next forward</button>
      <button type="button" data-action="left">Rotate left</button>
      <button type="button" data-action="right">Rotate right</button>
      <button type="button" data-action="reset">Reset pile</button>
    </div>
    <div class="strategy-card-pile" aria-label="Interactive strategy card pile"></div>
    <p class="strategy-card-status" aria-live="polite"></p>
  `;

  const flipbook = document.getElementById('flipbookWrap');
  const projectImages = document.querySelector('.project-images');
  if (flipbook && flipbook.parentNode) {
    flipbook.parentNode.insertBefore(section, flipbook);
  } else if (projectImages) {
    projectImages.appendChild(section);
  } else {
    return;
  }

  const pile = section.querySelector('.strategy-card-pile');
  const status = section.querySelector('.strategy-card-status');
  const cards = [];
  let selected = null;
  let topZ = filenames.length + 1;
  let activePointerId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let moved = false;

  function cardLabel(index) {
    return `Strategy card ${index + 1} of ${filenames.length}`;
  }

  function bringToFront(card, announce) {
    topZ += 1;
    card.style.zIndex = String(topZ);
    if (selected) selected.classList.remove('is-selected');
    selected = card;
    selected.classList.add('is-selected');
    if (announce !== false) status.textContent = `${card.getAttribute('aria-label')} selected`;
  }

  function applyTransform(card) {
    const x = Number(card.dataset.x || 0);
    const y = Number(card.dataset.y || 0);
    const r = Number(card.dataset.rotation || 0);
    card.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${r}deg)`;
  }

  function seededLayout(index, total) {
    const angle = (index / total) * Math.PI * 2;
    const ring = 45 + (index % 5) * 14;
    return {
      x: Math.cos(angle) * ring + ((index % 3) - 1) * 14,
      y: Math.sin(angle) * ring * 0.55 + ((index % 4) - 1.5) * 8,
      r: ((index * 17) % 31) - 15
    };
  }

  function resetPile() {
    cards.forEach((card, index) => {
      const layout = seededLayout(index, cards.length);
      card.dataset.x = layout.x.toFixed(1);
      card.dataset.y = layout.y.toFixed(1);
      card.dataset.rotation = layout.r.toFixed(1);
      card.style.zIndex = String(index + 1);
      applyTransform(card);
    });
    topZ = cards.length + 1;
    bringToFront(cards[cards.length - 1], false);
    status.textContent = 'Pile reset';
  }

  filenames.forEach((filename, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'strategy-card';
    card.setAttribute('aria-label', cardLabel(index));
    card.dataset.index = String(index);
    card.innerHTML = `<img src="Images/Thesis/Playing%20Cards/${filename}" alt="Strategy card ${index + 1}" draggable="false" loading="lazy">`;

    card.addEventListener('pointerdown', (event) => {
      if (activePointerId !== null) return;
      activePointerId = event.pointerId;
      moved = false;
      bringToFront(card, false);
      card.setPointerCapture(event.pointerId);
      const pileRect = pile.getBoundingClientRect();
      const x = Number(card.dataset.x || 0);
      const y = Number(card.dataset.y || 0);
      const centerX = pileRect.width / 2 + x;
      const centerY = pileRect.height / 2 + y;
      dragOffsetX = event.clientX - pileRect.left - centerX;
      dragOffsetY = event.clientY - pileRect.top - centerY;
    });

    card.addEventListener('pointermove', (event) => {
      if (activePointerId !== event.pointerId) return;
      const pileRect = pile.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const halfW = Math.min(cardRect.width / 2, pileRect.width / 2);
      const halfH = Math.min(cardRect.height / 2, pileRect.height / 2);
      let x = event.clientX - pileRect.left - pileRect.width / 2 - dragOffsetX;
      let y = event.clientY - pileRect.top - pileRect.height / 2 - dragOffsetY;
      x = Math.max(-pileRect.width / 2 + halfW, Math.min(pileRect.width / 2 - halfW, x));
      y = Math.max(-pileRect.height / 2 + halfH, Math.min(pileRect.height / 2 - halfH, y));
      card.dataset.x = x.toFixed(1);
      card.dataset.y = y.toFixed(1);
      moved = true;
      applyTransform(card);
    });

    function endDrag(event) {
      if (activePointerId !== event.pointerId) return;
      try { card.releasePointerCapture(event.pointerId); } catch (e) {}
      activePointerId = null;
      status.textContent = moved ? `${card.getAttribute('aria-label')} moved` : `${card.getAttribute('aria-label')} selected`;
    }

    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
    card.addEventListener('focus', () => bringToFront(card, false));
    card.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 18 : 8;
      let x = Number(card.dataset.x || 0);
      let y = Number(card.dataset.y || 0);
      if (event.key === 'ArrowLeft') x -= step;
      else if (event.key === 'ArrowRight') x += step;
      else if (event.key === 'ArrowUp') y -= step;
      else if (event.key === 'ArrowDown') y += step;
      else return;
      event.preventDefault();
      card.dataset.x = x.toFixed(1);
      card.dataset.y = y.toFixed(1);
      applyTransform(card);
    });

    pile.appendChild(card);
    cards.push(card);
  });

  section.querySelector('[data-action="shuffle"]').addEventListener('click', () => {
    cards.forEach((card) => {
      const maxX = Math.max(40, pile.clientWidth * 0.28);
      const maxY = Math.max(35, pile.clientHeight * 0.20);
      card.dataset.x = ((Math.random() * 2 - 1) * maxX).toFixed(1);
      card.dataset.y = ((Math.random() * 2 - 1) * maxY).toFixed(1);
      card.dataset.rotation = ((Math.random() * 34) - 17).toFixed(1);
      topZ += 1;
      card.style.zIndex = String(topZ);
      applyTransform(card);
    });
    bringToFront(cards[Math.floor(Math.random() * cards.length)], false);
    status.textContent = 'Cards shuffled';
  });

  section.querySelector('[data-action="next"]').addEventListener('click', () => {
    const currentIndex = selected ? Number(selected.dataset.index) : -1;
    const nextCard = cards[(currentIndex + 1) % cards.length];
    bringToFront(nextCard, true);
    nextCard.focus({ preventScroll: true });
  });

  function rotateSelected(delta) {
    if (!selected) bringToFront(cards[cards.length - 1], false);
    const current = Number(selected.dataset.rotation || 0);
    selected.dataset.rotation = String(current + delta);
    applyTransform(selected);
    status.textContent = `${selected.getAttribute('aria-label')} rotated ${delta > 0 ? 'right' : 'left'}`;
  }

  section.querySelector('[data-action="left"]').addEventListener('click', () => rotateSelected(-10));
  section.querySelector('[data-action="right"]').addEventListener('click', () => rotateSelected(10));
  section.querySelector('[data-action="reset"]').addEventListener('click', resetPile);

  resetPile();
})();
