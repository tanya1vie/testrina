(() => {
  const stages = Array.from(document.querySelectorAll('.draggable-card-stage'));
  if (!stages.length) return;

  let topZ = 100;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  stages.forEach((stage, stageIndex) => {
    const cards = Array.from(stage.querySelectorAll('.draggable-card'));
    if (!cards.length) return;

    const placePile = () => {
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;

      cards.forEach((card, index) => {
        const cardW = card.offsetWidth || 190;
        const cardH = card.offsetHeight || 260;
        const seed = index + stageIndex * 31;
        const xNoise = ((seed * 67) % 101) / 100 - 0.5;
        const yNoise = ((seed * 43) % 97) / 96 - 0.5;
        const left = clamp(
          stageWidth / 2 - cardW / 2 + xNoise * Math.min(stageWidth * 0.5, 250),
          0,
          Math.max(0, stageWidth - cardW)
        );
        const top = clamp(
          stageHeight / 2 - cardH / 2 + yNoise * Math.min(stageHeight * 0.24, 110),
          0,
          Math.max(0, stageHeight - cardH)
        );
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
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();

        topZ += 1;
        card.style.zIndex = String(topZ);
        card.classList.add('is-dragging');

        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = parseFloat(card.style.left) || 0;
        const startTop = parseFloat(card.style.top) || 0;
        const startRotation = parseFloat(card.dataset.rotation) || 0;

        try { card.setPointerCapture(event.pointerId); } catch (_) {}

        const onMove = (moveEvent) => {
          if (moveEvent.pointerId !== event.pointerId) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          if (moveEvent.shiftKey) {
            const rotation = startRotation + dx * 0.35;
            card.dataset.rotation = rotation.toFixed(1);
            card.style.transform = `rotate(${rotation}deg)`;
            return;
          }

          const maxLeft = Math.max(0, stage.clientWidth - card.offsetWidth);
          const maxTop = Math.max(0, stage.clientHeight - card.offsetHeight);
          card.style.left = `${clamp(startLeft + dx, 0, maxLeft)}px`;
          card.style.top = `${clamp(startTop + dy, 0, maxTop)}px`;
        };

        const finish = (finishEvent) => {
          if (finishEvent.pointerId !== event.pointerId) return;
          card.classList.remove('is-dragging');
          card.removeEventListener('pointermove', onMove);
          card.removeEventListener('pointerup', finish);
          card.removeEventListener('pointercancel', finish);
          try { card.releasePointerCapture(event.pointerId); } catch (_) {}
        };

        card.addEventListener('pointermove', onMove);
        card.addEventListener('pointerup', finish);
        card.addEventListener('pointercancel', finish);
      });

      card.addEventListener('click', () => {
        topZ += 1;
        card.style.zIndex = String(topZ);
      });
    });

    requestAnimationFrame(placePile);
    window.addEventListener('resize', placePile);
  });
})();
