document.addEventListener("DOMContentLoaded", () => {
  const leftPage = document.getElementById("pageLeft");
  const rightPage = document.getElementById("pageRight");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!leftPage || !rightPage || !prevBtn || !nextBtn) return;

  const imagePaths = Array.from(document.querySelectorAll("#flipbookImages img")).map((img) =>
    img.getAttribute("src"),
  );

  if (!imagePaths.length) return;

  // 0 = cover, then pairs [1,2], [3,4], [5,6]...
  let currentSpreadIndex = 0; // 0 = cover

  const maxSpreads = Math.ceil((imagePaths.length - 1) / 2);
  // e.g. 47 images: (46 / 2) = 23 spreads

  function updateView() {
    if (currentSpreadIndex === 0) {
      // COVER ONLY
      leftPage.style.backgroundImage = "";
      leftPage.style.opacity = "0";
      leftPage.style.pointerEvents = "none";

      rightPage.style.backgroundImage = `url('${imagePaths[0]}')`;
    } else {
      leftPage.style.opacity = "1";
      leftPage.style.pointerEvents = "auto";

      const pairIndex = currentSpreadIndex - 1; // 0 = first spread
      const leftIdx = 1 + pairIndex * 2;
      const rightIdx = leftIdx + 1;

      leftPage.style.backgroundImage = imagePaths[leftIdx] ? `url('${imagePaths[leftIdx]}')` : "";
      rightPage.style.backgroundImage = imagePaths[rightIdx]
        ? `url('${imagePaths[rightIdx]}')`
        : "";
    }

    prevBtn.disabled = currentSpreadIndex === 0;
    nextBtn.disabled = currentSpreadIndex >= maxSpreads;
  }

  function goNext() {
    if (currentSpreadIndex >= maxSpreads) return;

    const targetIndex = currentSpreadIndex + 1;

    // start flip animation on the current right page (showing the old image)
    rightPage.classList.add("turning");

    function onEnd() {
      rightPage.classList.remove("turning");
      rightPage.style.transform = ""; // reset just in case

      // NOW switch to the next spread
      currentSpreadIndex = targetIndex;
      updateView();

      rightPage.removeEventListener("animationend", onEnd);
    }

    rightPage.addEventListener("animationend", onEnd);
  }

  function goPrev() {
    if (currentSpreadIndex <= 0) return;
    currentSpreadIndex--;
    updateView();
  }

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);

  // initial: cover only
  updateView();
});
