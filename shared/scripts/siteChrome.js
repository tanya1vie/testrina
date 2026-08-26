document.addEventListener("DOMContentLoaded", async () => {
  const header = document.getElementById("header");
  const footer = document.getElementById("footer");

  if (header) {
    const response = await fetch("shared/components/header.html");
    header.innerHTML = await response.text();

    const bubbles = document.createElement("script");
    bubbles.src = "shared/scripts/headerBubbles.js";
    document.body.appendChild(bubbles);
  }

  if (footer) {
    const response = await fetch("shared/components/footer.html");
    footer.innerHTML = await response.text();
  }
});
