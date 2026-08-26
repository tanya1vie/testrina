
        // Optional: Add click event listeners for analytics or additional functionality
        document.querySelectorAll('.grid-item').forEach(item => {
            item.addEventListener('click', (e) => {
                console.log('Clicked:', item.querySelector('.design-type').textContent);
            });
        });

        document.querySelectorAll('.nav-icons a').forEach(icon => {
            icon.addEventListener('click', (e) => {
  e.stopPropagation();
  icon.style.animationPlayState = 'paused';

  const iconRect = icon.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.style.visibility = 'hidden';
  popup.style.position = 'fixed';
  popup.innerHTML = `
    <div class="popup-content">
      <p>${iconObj.message}</p>
      <button class="close-btn">X</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Measure popup size while hidden
  const popupRect = popup.getBoundingClientRect();

  // Position horizontally centered above the icon
  let leftPos = iconRect.left + (iconRect.width / 2) - (popupRect.width / 2);
  let topPos = iconRect.top - popupRect.height - 10; // 10px gap above icon

  // Make sure popup doesn't go off left edge
  if (leftPos < 10) leftPos = 10;

  // Make sure popup doesn't go off right edge
  if (leftPos + popupRect.width > window.innerWidth - 10) {
    leftPos = window.innerWidth - popupRect.width - 10;
  }

  // If there's no room above, place it below the icon
  if (topPos < 10) {
    topPos = iconRect.bottom + 10;
  }

  popup.style.left = `${leftPos}px`;
  popup.style.top = `${topPos}px`;

  popup.style.visibility = 'visible';

  popup.querySelector('.close-btn').addEventListener('click', () => {
    icon.style.animationPlayState = 'running';
    document.body.removeChild(popup);
  });
});


        });