const gallery = document.getElementById('gallery');
        const modal = document.getElementById('zoomModal');
        const zoomedImg = document.getElementById('zoomedImg');
      
        // Zoom functionality
        document.querySelectorAll('.gallery-item img').forEach(img => {
          img.addEventListener('click', () => {
            zoomedImg.src = img.src;
            modal.classList.add('show');
          });
      
          // Classify horizontal images and add staggered offset
          img.addEventListener('load', () => {
            const item = img.closest('.gallery-item');
            const isHorizontal = img.naturalWidth > img.naturalHeight;
            if (isHorizontal) item.classList.add('horizontal');
            // Apply stagger effect
            const offset = Math.floor(Math.random() * 100) - 50; // -50 to +50px
            item.style.setProperty('--offset', offset + 'px');
          });
        });
      
        modal.addEventListener('click', () => {
          modal.classList.remove('show');
          zoomedImg.src = '';
        });
      
        function scrollGallery(direction) {
          const scrollAmount = 300;
          gallery.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
        }