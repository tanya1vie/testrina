(() => {
  const main = document.querySelector('main.main');
  const stages = Array.from(document.querySelectorAll('.draggable-card-stage'));
  if (!main || !stages.length) return;

  let topZ = 100;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  stages.forEach((stage, stageIndex) => {
    const originalCards = Array.from(stage.querySelectorAll('.draggable-card'));
    if (!originalCards.length) return;

    // Replace nodes so any older card listeners from galleryscroll.js cannot conflict.
    const cards = originalCards.map((card) => {
      const cleanCard = card.cloneNode(true);
      card.replaceWith(cleanCard);
      return cleanCard;
    });

    const placePile = () => {
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      cards.forEach((card, index) => {
        if (card.classList.contains('is-dragging')) return;
        const cardW = card.offsetWidth || 190;
        const cardH = card.offsetHeight || 260;
        const seed = index + stageIndex * 29;
        const xNoise = ((seed * 67) % 101) / 100 - 0.5;
        const yNoise = ((seed * 43) % 97) / 96 - 0.5;
        const left = clamp(stageWidth / 2 - cardW / 2 + xNoise * Math.min(stageWidth * 0.44, 260), 0, Math.max(0, stageWidth - cardW));
        const top = clamp(stageHeight / 2 - cardH / 2 + yNoise * Math.min(stageHeight * 0.24, 110), 0, Math.max(0, stageHeight - cardH));
        const rotation = ((seed * 17) % 33) - 16;
        card.style.left = `${left}px`;
        card.style.top = `${top}px`;
        card.dataset.rotation = String(rotation);
        card.style.transform = `rotate(${rotation}deg)`;
        card.style.zIndex = String(20 + index);
      });
    };

    cards.forEach((card) => {
      card.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        topZ += 1;
        card.style.zIndex = String(topZ);

        const rect = card.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const startRotation = Number(card.dataset.rotation || 0);

        card.style.width = `${rect.width}px`;
        card.classList.add('is-dragging');
        main.appendChild(card);
        card.style.left = `${rect.left - mainRect.left + main.scrollLeft}px`;
        card.style.top = `${rect.top - mainRect.top + main.scrollTop}px`;

        const startLeft = parseFloat(card.style.left) || 0;
        const startTop = parseFloat(card.style.top) || 0;

        const onMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (moveEvent.shiftKey) {
            const rotation = startRotation + dx * 0.35;
            card.dataset.rotation = rotation.toFixed(1);
            card.style.transform = `rotate(${rotation}deg)`;
            return;
          }
          const maxLeft = Math.max(0, main.clientWidth - card.offsetWidth);
          const maxTop = Math.max(0, main.scrollHeight - card.offsetHeight);
          card.style.left = `${clamp(startLeft + dx, 0, maxLeft)}px`;
          card.style.top = `${clamp(startTop + dy, 0, maxTop)}px`;
        };

        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp, { once: true });
        window.addEventListener('pointercancel', onUp, { once: true });
      });

      card.addEventListener('click', () => {
        topZ += 1;
        card.style.zIndex = String(topZ);
      });
    });

    requestAnimationFrame(placePile);
  });
})();
