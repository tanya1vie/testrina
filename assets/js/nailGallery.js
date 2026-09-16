(() => {
  const grid = document.getElementById("nailGallery");
  const modal = document.getElementById("nailModal");
  const stage = document.getElementById("nailMediaStage");
  const dots = document.getElementById("nailDots");
  const title = document.getElementById("nailTitle");
  const meta = document.getElementById("nailMeta");
  const caption = document.getElementById("nailCaption");
  const instagram = document.getElementById("nailInstagram");
  const close = document.getElementById("nailClose");
  const previous = document.getElementById("nailPrevious");
  const next = document.getElementById("nailNext");
  let activeIndex = 0;
  let lastFocus = null;

  function showMedia(index) {
    const items = [...stage.querySelectorAll("img, video")];
    if (!items.length) return;
    activeIndex = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => {
      const active = itemIndex === activeIndex;
      item.classList.toggle("active", active);
      if (!active && item.tagName === "VIDEO") item.pause();
    });
    [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === activeIndex));
  }

  function closeModal() {
    stage.querySelectorAll("video").forEach(video => video.pause());
    modal.hidden = true;
    document.body.style.overflow = "";
    lastFocus?.focus();
  }

  function openSet(set, trigger) {
    lastFocus = trigger;
    activeIndex = 0;
    stage.querySelectorAll("img, video").forEach(item => item.remove());
    dots.replaceChildren();

    const orderedMedia = [...set.media].sort((a, b) => {
      if (a.type === b.type) return 0;
      return a.type === "video" ? -1 : 1;
    });

    orderedMedia.forEach((item, index) => {
      const media = document.createElement(item.type === "video" ? "video" : "img");
      media.src = item.src;
      if (item.type === "video") {
        media.controls = true;
        media.playsInline = true;
        media.preload = "metadata";
      } else {
        media.alt = `${set.name} — image ${index + 1}`;
      }
      if (index === 0) media.classList.add("active");
      stage.appendChild(media);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show media ${index + 1}`);
      if (index === 0) dot.classList.add("active");
      dot.addEventListener("click", () => showMedia(index));
      dots.appendChild(dot);
    });

    title.textContent = set.name;
    const details = [
      set.shape && `Shape: ${set.shape}`,\n      set.size && `Size: ${set.size}`,
      set.collection && `Collection: ${set.collection}`,
      set.client && `Client: ${set.client}`
    ].filter(Boolean);
    meta.textContent = details.join(" · ");
    caption.textContent = set.caption || "";
    caption.hidden = !caption.textContent;
    instagram.hidden = !set.instagram_url;
    instagram.href = set.instagram_url || "#";

    const showNavigation = orderedMedia.length > 1;
    previous.hidden = !showNavigation;
    next.hidden = !showNavigation;
    dots.hidden = !showNavigation;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    close.focus();
  }

  function render(sets) {
    grid.replaceChildren();
    if (!sets.length) {
      grid.innerHTML = '<p class="gallery-status">No nail sets have been added yet.</p>';
      return;
    }

    sets.forEach(set => {
      const card = document.createElement("article");
      card.className = "nail-card";
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `View ${set.name}`);

      const image = document.createElement("img");
      image.src = set.cover;
      image.alt = set.name;
      image.loading = "lazy";

      button.appendChild(image);
      button.addEventListener("click", () => openSet(set, button));
      card.appendChild(button);
      grid.appendChild(card);
    });
  }

  close.addEventListener("click", closeModal);
  previous.addEventListener("click", () => showMedia(activeIndex - 1));
  next.addEventListener("click", () => showMedia(activeIndex + 1));
  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", event => {
    if (modal.hidden) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") showMedia(activeIndex - 1);
    if (event.key === "ArrowRight") showMedia(activeIndex + 1);
  });

  fetch("assets/data/nails-gallery.json", { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error(`Gallery data request failed (${response.status})`);
      return response.json();
    })
    .then(data => render(Array.isArray(data.sets) ? data.sets : []))
    .catch(error => {
      console.error(error);
      grid.innerHTML = '<p class="gallery-status">The nail gallery is temporarily unavailable.</p>';
    });
})();
