document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".flip-container");
  const words = Array.from(document.querySelectorAll(".flip-word"));
  if (!container || words.length === 0) return;

  // Make container wide enough for the longest word so layout doesn't jump
  const longest = words.reduce((a, b) =>
    (a.textContent.trim().length > b.textContent.trim().length ? a : b)
  );
  container.style.width = longest.getBoundingClientRect().width + "px";

  let index = words.findIndex(w => w.classList.contains("active"));
  if (index < 0) index = 0;

  setInterval(() => {
    const current = words[index];
    current.classList.remove("active");
    current.classList.add("exit");

    index = (index + 1) % words.length;

    const next = words[index];
    next.classList.remove("exit");
    next.classList.add("active");
  }, 2000);
});
