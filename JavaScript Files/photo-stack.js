document.querySelectorAll('.draggable-image').forEach(img => {
    let isDragging = false;
    let offsetX, offsetY;
    let rotation = 0;
    let scale = 1;

    img.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      img.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      img.style.cursor = 'grab';
    });

    // Rotate with R key
    img.addEventListener('dblclick', () => {
      rotation += 15;
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
    });

    // Scale with mouse wheel
    img.addEventListener('wheel', (e) => {
      e.preventDefault();
      scale += e.deltaY < 0 ? 0.1 : -0.1;
      scale = Math.max(0.2, Math.min(scale, 3)); // Clamp scale
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
    });
  });