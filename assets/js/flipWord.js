document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".flip-container");
  const words = Array.from(document.querySelectorAll(".flip-word"));
  if (!container || words.length === 0) return;

  // Find initial active word (fallback to first)
  let index = words.findIndex(w => w.classList.contains("active"));
  if (index < 0) index = 0;

  // Helper: set container width to match a given word
  function syncWidth(word) {
    if (!word) return;
    const w = word.getBoundingClientRect().width;
    container.style.width = w + "px";
  }

  // Initial width
  syncWidth(words[index]);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    words.forEach((word, wordIndex) => {
      word.classList.toggle("active", wordIndex === index);
      word.classList.remove("exit");
    });
    return;
  }

  // Keep width correct on resize
  window.addEventListener("resize", () => {
    syncWidth(words[index]);
  });

  setInterval(() => {
    const current = words[index];
    current.classList.remove("active");
    current.classList.add("exit");

    index = (index + 1) % words.length;
    const next = words[index];

    // Update width based on the next word
    syncWidth(next);

    next.classList.remove("exit");
    next.classList.add("active");
  }, 2000);
});
