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
  const projectImages = document.querySelector('.project-images');
  const flipbook = document.getElementById('flipbookWrap');
  if (!title || !main || !projectImages || !flipbook || !title.textContent.includes('ARCHITECTURE AS PROSTHESIS')) return;
  if (document.querySelector('.strategy-card-section')) return;

  const archives = Array.from(projectImages.querySelectorAll('.thesis-book-archive'));
  const dormArchive = archives.find(section => section.querySelector('img[src*="/TanyaBook/"]'));
  const miesArchive = archives.find(section => section.querySelector('img[src*="/MiesBook/"]'));
  const moriyamaArchive = archives.find(section => section.querySelector('img[src*="/SanaBook/"]'));
  if (!dormArchive || !miesArchive || !moriyamaArchive) return;

  const cards = [
    'cards-2.jpg', 'cards-22.jpg', 'cards-23.jpg', 'cards-24.jpg', 'cards-25.jpg',
    'cards-26.jpg', 'cards-27.jpg', 'cards-28.jpg', 'cards-29.jpg', 'cards-3.jpg',
    'cards-32.jpg', 'cards-33.jpg', 'cards-34.jpg', 'cards-35.jpg', 'cards-36.jpg',
    'cards-37.jpg', 'cards-38.jpg', 'cards-39.jpg'
  ];

  const simulationFrames = [
    'Screenshot 2026-08-28 at 4.15.15\u202fPM.png',
    'Screenshot 2026-08-28 at 4.15.23\u202fPM.png',
    'Screenshot 2026-08-28 at 4.15.35\u202fPM.png',
    'Screenshot 2026-08-28 at 4.15.42\u202fPM.png',
    'Screenshot 2026-08-28 at 4.15.47\u202fPM.png',
    'Screenshot 2026-08-28 at 4.15.56\u202fPM.png',
    'Screenshot 2026-08-28 at 4.16.10\u202fPM.png',
    'Screenshot 2026-08-28 at 4.16.15\u202fPM.png',
    'Screenshot 2026-08-28 at 4.16.25\u202fPM.png',
    'Screenshot 2026-08-28 at 4.16.38\u202fPM.png',
    'Screenshot 2026-08-28 at 4.16.43\u202fPM.png',
    'Screenshot 2026-08-28 at 4.16.52\u202fPM.png',
    'Screenshot 2026-08-28 at 4.16.58\u202fPM.png',
    'Screenshot 2026-08-28 at 4.17.04\u202fPM.png',
    'Screenshot 2026-08-28 at 4.17.11\u202fPM.png',
    'Screenshot 2026-08-28 at 4.17.17\u202fPM.png',
    'Screenshot 2026-08-28 at 4.17.22\u202fPM.png',
    'Screenshot 2026-08-28 at 4.17.32\u202fPM.png',
    'Screenshot 2026-08-28 at 4.17.39\u202fPM.png',
    'Screenshot 2026-08-28 at 4.17.47\u202fPM.png',
    'Screenshot 2026-08-28 at 4.18.25\u202fPM.png',
    'Screenshot 2026-08-28 at 4.18.36\u202fPM.png',
    'Screenshot 2026-08-28 at 4.19.04\u202fPM.png',
    'Screenshot 2026-08-28 at 4.20.17\u202fPM.png',
    'Screenshot 2026-08-28 at 4.20.25\u202fPM.png',
    'Screenshot 2026-08-28 at 11.10.52\u202fPM.png',
    'Screenshot 2026-08-28 at 11.11.05\u202fPM.png',
    'Screenshot 2026-08-28 at 11.11.48\u202fPM.png',
    'Screenshot 2026-08-28 at 11.11.53\u202fPM.png',
    'Screenshot 2026-08-28 at 11.11.59\u202fPM.png',
    'Screenshot 2026-08-28 at 11.12.13\u202fPM.png',
    'Screenshot 2026-08-28 at 11.12.18\u202fPM.png',
    'Screenshot 2026-08-28 at 11.12.31\u202fPM.png'
  ];

  const style = document.createElement('style');
  style.textContent = `
    main.main { position: relative; }
    .thesis-context, .thesis-case-copy, .thesis-strategy-copy { max-width: 900px; margin: 88px auto 30px; }
    .thesis-context h2, .thesis-case-copy h2, .thesis-strategy-copy h2 { margin: 0 0 14px; }
    .thesis-context p, .thesis-case-copy p, .thesis-strategy-copy p { max-width: 790px; margin: 0 0 12px; }
    .thesis-kicker { margin-bottom: 7px !important; opacity: .58; text-transform: uppercase; letter-spacing: .08em; }
    .thesis-revision { opacity: .78; }
    .thesis-wide-visual { width: 100%; margin: 24px 0 70px; }
    .thesis-wide-visual img { display: block; width: 100%; height: auto; margin: 0; object-fit: contain; }
    .thesis-visual-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; align-items: start; margin: 28px 0 76px; }
    .thesis-visual-pair img { display: block; width: 100%; height: auto; margin: 0; object-fit: contain; }
    .thesis-timeline { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 24px 0 78px; }
    .thesis-timeline img { width: 100%; height: auto; margin: 0; object-fit: contain; }
    .thesis-human { display: block; width: min(100%, 850px); height: auto; margin: 24px auto 46px; object-fit: contain; }
    .thesis-book-archive { margin-bottom: 72px; }
    .thesis-book-archive > h2 { margin-bottom: 24px; }
    .thesis-simulation-section { margin: 90px 0 94px; }
    .thesis-simulation-section > p { max-width: 760px; margin-bottom: 24px; }
    .thesis-simulation-strip { display: grid; grid-auto-flow: column; grid-template-rows: repeat(2, minmax(170px, 24vw)); grid-auto-columns: minmax(260px, 34vw); gap: 14px; overflow-x: auto; overscroll-behavior-inline: contain; padding: 4px 2px 18px; scroll-snap-type: x proximity; }
    .thesis-simulation-strip img { width: 100%; height: 100%; margin: 0; object-fit: contain; scroll-snap-align: start; background: transparent; }
    .thesis-provocations { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; align-items: start; margin: 28px 0 88px; }
    .thesis-provocations img { display: block; width: 100%; height: auto; margin: 0; object-fit: contain; }
    .strategy-card-section { width: 100%; margin: 90px 0 60px; position: relative; z-index: 1; }
    .strategy-card-heading { margin-bottom: 12px; }
    .strategy-card-summary { max-width: 800px; margin: 0 0 12px; }
    .strategy-card-instructions { max-width: 720px; margin: 0 0 28px; opacity: .62; }
    .strategy-card-stage { position: relative; width: 100%; height: 470px; }
    .strategy-card { position: absolute; width: clamp(150px, 19vw, 230px); height: auto; padding: 0; margin: 0; border: 0; outline: 0; background: transparent; box-shadow: 0 8px 22px rgba(0,0,0,.18); cursor: grab; user-select: none; touch-action: none; transform-origin: center center; will-change: left, top, transform; z-index: 20; }
    .strategy-card:active { cursor: grabbing; }
    .strategy-card:focus-visible { box-shadow: 0 12px 30px rgba(0,0,0,.28); }
    .strategy-card img { display: block; width: 100%; height: auto; margin: 0; object-fit: contain; pointer-events: none; }
    .strategy-card.is-dragging { max-width: none; z-index: 60; }
    @media (max-width: 760px) {
      .thesis-context, .thesis-case-copy, .thesis-strategy-copy { margin-top: 60px; }
      .thesis-visual-pair, .thesis-provocations { grid-template-columns: 1fr; }
      .thesis-timeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .thesis-simulation-strip { grid-template-rows: repeat(2, 150px); grid-auto-columns: minmax(220px, 80vw); }
      .strategy-card-stage { height: 400px; }
      .strategy-card { width: clamp(125px, 38vw, 185px); }
    }
  `;
  document.head.appendChild(style);

  const intro = document.querySelector('.project-description p');
  if (intro) {
    intro.textContent = 'Humans have always adapted to the environments they build. From early shelters to today’s sealed, mechanically conditioned interiors, architecture increasingly acts like a prosthesis — a third skin around the body. This thesis asks what happens when that relationship plays out over generations.';
  }

  const openingParagraph = projectImages.querySelector(':scope > p');
  if (openingParagraph) {
    openingParagraph.textContent = 'Using modified simulations in The Sims 4, three homes become evolutionary experiments. Each rewards different habits, senses and movements, producing three speculative future bodies. Those outcomes are translated into 18 strategies for architecture that keeps people adaptable instead of over-specialized.';
  }

  // Remove standalone case-study images already dropped into the page so they can be
  // deliberately reinserted beside the correct case instead of appearing twice.
  ['Human Org.jpg', 'dorm human.jpg', 'farns human.jpg', 'sejima human.jpg'].forEach(name => {
    projectImages.querySelectorAll(`img[src="Images/Thesis/${name}"]`).forEach(img => img.remove());
  });

  const makeImage = (filename, alt, loading = 'lazy') => {
    const img = document.createElement('img');
    img.src = `Images/Thesis/${encodeURIComponent(filename).replace(/%2F/g, '/')}`;
    img.alt = alt;
    if (loading) img.loading = loading;
    return img;
  };

  const makeCase = (kicker, heading, body, revision) => {
    const section = document.createElement('section');
    section.className = 'thesis-case-copy';
    section.innerHTML = `<p class="thesis-kicker">${kicker}</p><h2>${heading}</h2><p>${body}</p><p class="thesis-revision"><strong>Revision:</strong> ${revision}</p>`;
    return section;
  };

  const context = document.createElement('section');
  context.className = 'thesis-context';
  context.innerHTML = '<p class="thesis-kicker">Background</p><h2>FROM SHELTER TO PROSTHESIS</h2><p>Architecture began as protection from climate, but increasingly became a controlled interior climate of its own. As heating, cooling, lighting and digital life smooth away environmental variation, the built environment becomes an active pressure on how bodies behave and adapt.</p>';

  const contextPair = document.createElement('div');
  contextPair.className = 'thesis-visual-pair';
  contextPair.append(
    makeImage('Human Org.jpg', 'Diagram of human biological organization and adaptation used in Architecture as Prosthesis'),
    makeImage('taonomy.jpg', 'Architecture as Prosthesis taxonomy diagram mapping architectural and human adaptations')
  );

  const timeline = document.createElement('div');
  timeline.className = 'thesis-timeline';
  ['Timeline1.jpg', 'Timeline2.jpg', 'Timeline3.jpg', 'Timeline4.jpg'].forEach((name, index) => {
    timeline.appendChild(makeImage(name, `Architecture as Prosthesis historical timeline panel ${index + 1}`));
  });

  const firstArchive = archives[0];
  projectImages.insertBefore(context, firstArchive);
  context.insertAdjacentElement('afterend', contextPair);
  contextPair.insertAdjacentElement('afterend', timeline);

  const simulationSection = document.createElement('section');
  simulationSection.className = 'thesis-simulation-section';
  simulationSection.innerHTML = '<h2>SIMULATING GENERATIONS</h2><p>The simulations turn each house into a long-term experiment: architectural conditions reward or discourage behaviors, and those accumulated pressures become speculative physical, social and sensory adaptations.</p>';
  const simulationStrip = document.createElement('div');
  simulationStrip.className = 'thesis-simulation-strip';
  simulationFrames.forEach((name, index) => {
    simulationStrip.appendChild(makeImage(name, `Architecture as Prosthesis simulation study frame ${index + 1}`));
  });
  simulationSection.appendChild(simulationStrip);
  timeline.insertAdjacentElement('afterend', simulationSection);

  const dormCopy = makeCase(
    'Case 01',
    'THE DORM',
    'A generic MIT efficiency apartment becomes the control. Tight space, weak daylight, screens, flat floors and steady HVAC reward sitting still and staying inside. Over generations, the body becomes optimized for a sedentary, technology-heavy interior life.',
    'Variable floor heights, unflat flooring, stronger daylight and longer sight lines, plus more exchange between inside and outside, put movement and environmental variation back into everyday life.'
  );
  const dormHuman = makeImage('dorm human.jpg', 'Speculative future human adapted to the dorm case study');
  dormHuman.className = 'thesis-human';
  dormArchive.querySelector('h2').textContent = 'DORM — BOOKLET';
  dormArchive.querySelector('h2').id = 'dormBookHeading';
  dormArchive.setAttribute('aria-labelledby', 'dormBookHeading');
  const dormGallery = dormArchive.querySelector('[id]');
  if (dormGallery && dormGallery.id !== 'dormBookHeading') dormGallery.id = 'dormBookGallery';
  simulationSection.insertAdjacentElement('afterend', dormCopy);
  dormCopy.insertAdjacentElement('afterend', dormHuman);
  dormHuman.insertAdjacentElement('afterend', dormArchive);

  const farnsworthCopy = makeCase(
    'Case 02',
    'FARNSWORTH HOUSE',
    'Mies van der Rohe’s glass pavilion produces the opposite pressure: exposure. Hard surfaces, minimal furniture, open planning and constant visibility tune the body to a highly controlled modernist world while reducing privacy and tolerance for softer, less predictable terrain.',
    'Soft partitions, dynamic layouts, variable levels, seasonal zones and passive ventilation keep the openness but make the house less physically and socially prescriptive.'
  );
  const farnsworthHuman = makeImage('farns human.jpg', 'Speculative future human adapted to the Farnsworth House case study');
  farnsworthHuman.className = 'thesis-human';
  miesArchive.querySelector('h2').textContent = 'FARNSWORTH HOUSE — BOOKLET';
  dormArchive.insertAdjacentElement('afterend', farnsworthCopy);
  farnsworthCopy.insertAdjacentElement('afterend', farnsworthHuman);
  farnsworthHuman.insertAdjacentElement('afterend', miesArchive);

  const moriyamaCopy = makeCase(
    'Case 03',
    'MORIYAMA HOUSE',
    'Ryue Nishizawa’s fragmented house turns daily life into a sequence of thresholds. Moving between small rooms and outdoor space rewards balance, flexibility, environmental awareness and sensitivity to others.',
    'Movable elements, uneven floors, seasonal spaces, augmented rather than total HVAC, and acoustic zoning preserve the house’s productive instability while giving occupants more ways to adapt.'
  );
  const moriyamaHuman = makeImage('sejima human.jpg', 'Speculative future human adapted to the Moriyama House case study');
  moriyamaHuman.className = 'thesis-human';
  moriyamaArchive.querySelector('h2').textContent = 'MORIYAMA HOUSE — BOOKLET';
  moriyamaArchive.querySelector('h2').id = 'moriyamaBookHeading';
  moriyamaArchive.setAttribute('aria-labelledby', 'moriyamaBookHeading');
  const moriyamaGallery = moriyamaArchive.querySelector('[id]');
  if (moriyamaGallery && moriyamaGallery.id !== 'moriyamaBookHeading') moriyamaGallery.id = 'moriyamaBookGallery';
  miesArchive.insertAdjacentElement('afterend', moriyamaCopy);
  moriyamaCopy.insertAdjacentElement('afterend', moriyamaHuman);
  moriyamaHuman.insertAdjacentElement('afterend', moriyamaArchive);

  const strategySection = document.createElement('section');
  strategySection.className = 'strategy-card-section';
  strategySection.innerHTML = '<h2 class="strategy-card-heading">18 STRATEGIES</h2><p class="strategy-card-summary">The three cases become a toolkit rather than a single ideal building. The strategies challenge physical habits, increase sensory engagement, blur the line between interior and climate, and loosen rigid program. The goal is simple: design for variation, not frictionless comfort.</p><p class="strategy-card-instructions">Drag the strategy cards anywhere across the thesis page. Click or tap a card to bring it forward. Hold Shift while dragging to rotate it.</p><div class="strategy-card-stage"></div>';
  moriyamaArchive.insertAdjacentElement('afterend', strategySection);

  const provocations = document.createElement('div');
  provocations.className = 'thesis-provocations';
  ['ad4.jpg', 'ad5.jpg', 'ad6.jpg'].forEach((name, index) => {
    provocations.appendChild(makeImage(name, `Architecture as Prosthesis design provocation graphic ${index + 1}`));
  });
  strategySection.insertAdjacentElement('afterend', provocations);

  const fullBookCopy = document.createElement('section');
  fullBookCopy.className = 'thesis-strategy-copy';
  fullBookCopy.innerHTML = '<p class="thesis-kicker">Full thesis</p><h2>ARCHITECTURE AS PROSTHESIS</h2><p>Flip through the complete thesis to see the research, simulations, case studies and strategy catalogue together.</p>';
  provocations.insertAdjacentElement('afterend', fullBookCopy);
  fullBookCopy.insertAdjacentElement('afterend', flipbook);

  const stage = strategySection.querySelector('.strategy-card-stage');
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

  function placePile() {
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const pile = Array.from(stage.querySelectorAll('.strategy-card'));
    pile.forEach((card, index) => {
      const cardW = card.offsetWidth || 190;
      const cardH = card.offsetHeight || 260;
      const spreadX = Math.min(stageWidth * .22, 190);
      const spreadY = Math.min(stageHeight * .12, 54);
      const xNoise = ((index * 67) % 101) / 100 - .5;
      const yNoise = ((index * 43) % 97) / 96 - .5;
      const left = clamp(stageWidth / 2 - cardW / 2 + xNoise * spreadX * 2, 0, Math.max(0, stageWidth - cardW));
      const top = clamp(stageHeight / 2 - cardH / 2 + yNoise * spreadY * 2, 0, Math.max(0, stageHeight - cardH));
      const rotation = ((index * 17) % 33) - 16;
      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      card.dataset.rotation = String(rotation);
      card.style.transform = `rotate(${rotation}deg)`;
      card.style.zIndex = String(20 + index);
    });
  }

  cards.forEach((filename, index) => {
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

  requestAnimationFrame(placePile);
})();
