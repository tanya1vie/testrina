(function(){
  const buttons = document.querySelector(".header-buttons");
  if (!buttons) return;

  const items = Array.from(buttons.querySelectorAll(".header-icon"));

  function clearRepel(){
    items.forEach(el => el.style.setProperty("--repel", "0px"));
  }

  function applyRepel(activeIndex){
    const maxPush1 = 10;  // immediate neighbor
    const maxPush2 = 5;   // second neighbor

    items.forEach((el, i) => {
      const d = i - activeIndex;
      let push = 0;

      if (Math.abs(d) === 1) push = Math.sign(d) * maxPush1;
      else if (Math.abs(d) === 2) push = Math.sign(d) * maxPush2;

      el.style.setProperty("--repel", `${push}px`);
    });
  }

  items.forEach((el, idx) => {
    el.addEventListener("mouseenter", () => applyRepel(idx));
    el.addEventListener("focus", () => applyRepel(idx));
    el.addEventListener("mouseleave", clearRepel);
    el.addEventListener("blur", clearRepel);
  });

  buttons.addEventListener("mouseleave", clearRepel);
})();
