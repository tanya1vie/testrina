// page-fade.js
(function () {
  // ensure hidden initially
  if (document.body) {
    document.body.classList.remove("page-loaded");
  }

  // Fade in as soon as DOM is ready (doesn't wait for images)
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("page-loaded");
  });

  // Safety fallback in case DOMContentLoaded is missed
  window.addEventListener("load", () => {
    document.body.classList.add("page-loaded");
  });
})();
