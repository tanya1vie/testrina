(function(){
  const buttons = document.querySelector(".header-buttons");
  if (buttons) {
    const items = Array.from(buttons.querySelectorAll(".header-icon"));

    function clearRepel(){
      items.forEach(el => el.style.setProperty("--repel", "0px"));
    }

    function applyRepel(activeIndex){
      const maxPush1 = 10;
      const maxPush2 = 5;

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
  }

  if (!document.querySelector('script[data-read-more-links]')) {
    const script = document.createElement('script');
    script.src = 'assets/js/readMoreLinks.js';
    script.dataset.readMoreLinks = 'true';
    document.body.appendChild(script);
  }
})();
