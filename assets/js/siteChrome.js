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

  if (
    document.querySelector("main .project-header") &&
    !document.querySelector('script[src$="assets/js/projectFigures.js"]')
  ) {
    const figures = document.createElement("script");
    figures.src = "assets/js/projectFigures.js";
    document.body.appendChild(figures);
  }
});
