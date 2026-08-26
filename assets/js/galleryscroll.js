(function(){
  const gallery = document.getElementById('gallery');
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
    lbImg.style.width = '';                    // reset any previous sizing
    lbImg.style.height = '';

    lbImg.onload = () => sizeImage75();        // size after intrinsic dims are known
    lbImg.src = src;
    lbImg.alt = alt || '';

    document.body.style.overflow = 'hidden';
    lightbox.style.display = 'flex';
  }

  function closeLightbox(){
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    lbImg.src = '';
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
  lbCloseBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });

  // Re-clamp on resize (keeps 75% sizing within viewport)
  window.addEventListener('resize', ()=>{
    if (lightbox.style.display === 'flex' && lbImg.complete) sizeImage80();
  });
})();