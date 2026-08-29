document.addEventListener("DOMContentLoaded", async () => {
  const header = document.getElementById("header");
  const footer = document.getElementById("footer");

  if (header) {
    const response = await fetch("header.html");
    header.innerHTML = await response.text();

    const bubbles = document.createElement("script");
    bubbles.src = "assets/js/headerBubbles.js";
    document.body.appendChild(bubbles);
  }

  if (footer) {
    const response = await fetch("footer.html");
    footer.innerHTML = await response.text();
  }

  setupProjectFigureCaptions();
});

function setupProjectFigureCaptions() {
  const main = document.querySelector("main");
  if (!main || !main.querySelector(".project-header")) return;

  if (!document.querySelector('link[data-project-captions]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "assets/css/projectCaptions.css";
    stylesheet.dataset.projectCaptions = "true";
    document.head.appendChild(stylesheet);
  }

  const refreshCaptions = () => {
    const images = Array.from(main.querySelectorAll("img")).filter((img) => {
      if (img.matches("[data-no-figure-caption]")) return false;
      if (img.closest(".lightbox, .modal, template")) return false;
      return true;
    });

    images.forEach((img, index) => {
      const label = `fig ${index + 1}.`;
      let figure = img.closest("figure.auto-project-figure, figure");

      if (!figure || !figure.contains(img)) {
        figure = document.createElement("figure");
        figure.className = "auto-project-figure";
        img.parentNode.insertBefore(figure, img);
        figure.appendChild(img);
      } else {
        figure.classList.add("auto-project-figure");
      }

      let caption = figure.querySelector(":scope > figcaption");
      if (!caption) {
        caption = document.createElement("figcaption");
        figure.appendChild(caption);
      }

      const description = img.dataset.caption || img.getAttribute("alt") || "";
      caption.classList.add("auto-project-caption");
      caption.textContent = description ? `${label} ${description}` : label;
    });
  };

  refreshCaptions();

  const observer = new MutationObserver((mutations) => {
    const hasImageChange = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some((node) =>
        node.nodeType === 1 && (node.matches?.("img") || node.querySelector?.("img"))
      )
    );
    if (hasImageChange) refreshCaptions();
  });

  observer.observe(main, { childList: true, subtree: true });
}
