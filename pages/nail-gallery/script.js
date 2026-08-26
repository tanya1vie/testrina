(() => {
  const grid = document.getElementById("instagramGallery");
  const overlay = document.getElementById("popupOverlay");
  const gallery = document.getElementById("popupGallery");
  const dotsContainer = document.getElementById("carouselDots");
  const title = document.getElementById("popupTitle");
  const date = document.getElementById("popupYear");
  const description = document.getElementById("popupDescription");
  const postLink = document.getElementById("popupPostLink");
  const closeButton = document.getElementById("closePopup");
  let timer;

  function mediaItems(post) {
    if (Array.isArray(post.children) && post.children.length) return post.children;
    return [
      { media_type: post.media_type, media_url: post.media_url, thumbnail_url: post.thumbnail_url },
    ];
  }

  function previewUrl(post) {
    const first = mediaItems(post)[0] || {};
    return first.thumbnail_url || first.media_url || post.thumbnail_url || post.media_url;
  }

  function closePopup() {
    clearInterval(timer);
    gallery.querySelectorAll("video").forEach((video) => video.pause());
    overlay.hidden = true;
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  function openPost(post) {
    clearInterval(timer);
    gallery.replaceChildren();
    dotsContainer.replaceChildren();

    title.textContent = "Instagram post";
    date.textContent = post.timestamp
      ? new Intl.DateTimeFormat(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(post.timestamp))
      : "";
    description.textContent = post.caption || "";
    postLink.href = post.permalink;

    const items = mediaItems(post);
    let index = 0;

    items.forEach((item, itemIndex) => {
      const isVideo = item.media_type === "VIDEO";
      const media = document.createElement(isVideo ? "video" : "img");
      media.src = item.media_url;
      media.alt = post.caption ? post.caption.slice(0, 140) : "Nail art from Instagram";
      if (isVideo) {
        media.controls = true;
        media.playsInline = true;
        media.poster = item.thumbnail_url || "";
      }
      if (itemIndex === 0) media.classList.add("active");
      gallery.appendChild(media);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show media ${itemIndex + 1}`);
      if (itemIndex === 0) dot.classList.add("active");
      dot.addEventListener("click", () => {
        index = itemIndex;
        showSlide();
        restartTimer();
      });
      dotsContainer.appendChild(dot);
    });

    const slides = [...gallery.children];
    const dots = [...dotsContainer.children];
    function showSlide() {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        if (slide.tagName === "VIDEO" && i !== index) slide.pause();
      });
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }
    function nextSlide() {
      index = (index + 1) % slides.length;
      showSlide();
    }
    function restartTimer() {
      clearInterval(timer);
      if (slides.length > 1) timer = setInterval(nextSlide, 4000);
    }
    restartTimer();

    overlay.hidden = false;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function render(posts) {
    grid.replaceChildren();
    if (!posts.length) {
      grid.innerHTML = '<p class="gallery-status">No Instagram posts are available yet.</p>';
      return;
    }
    posts.forEach((post) => {
      const imageUrl = previewUrl(post);
      if (!imageUrl || !post.permalink) return;
      const card = document.createElement("article");
      card.className = "project-card";
      const button = document.createElement("button");
      button.className = "project-link";
      button.type = "button";
      button.setAttribute(
        "aria-label",
        post.caption ? `Open: ${post.caption.slice(0, 100)}` : "Open Instagram post",
      );
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = post.caption ? post.caption.slice(0, 140) : "Nail art from Instagram";
      image.loading = "lazy";
      button.appendChild(image);
      button.addEventListener("click", () => openPost(post));
      card.appendChild(button);
      grid.appendChild(card);
    });
  }

  closeButton.addEventListener("click", closePopup);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closePopup();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) closePopup();
  });

  fetch("shared/data/instagram-posts.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Feed request failed (${response.status})`);
      return response.json();
    })
    .then((data) => render(Array.isArray(data.posts) ? data.posts : []))
    .catch((error) => {
      console.error(error);
      grid.innerHTML =
        '<p class="gallery-status">The Instagram gallery is temporarily unavailable.</p>';
    });
})();
