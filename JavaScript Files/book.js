document.addEventListener('DOMContentLoaded', () => {
  const bookEl  = document.getElementById('book');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // read all <img> inside hidden container
  const imagePaths = Array.from(
    document.querySelectorAll('#flipbookImages img')
  ).map(img => img.getAttribute('src'));

  // if nothing found, abort
  if (!imagePaths.length || !bookEl || !prevBtn || !nextBtn) return;

  let sheets = [];
  let currentIndex = 0; // 0 = cover sheet

  function setRatioFromFirst(imgURL){
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const r = im.naturalHeight / im.naturalWidth; // height / width
        document.documentElement.style.setProperty('--ratio', r.toString());
        resolve();
      };
      im.onerror = () => resolve();
      im.src = imgURL;
    });
  }

  function clearSheets() {
    bookEl.querySelectorAll('.sheet').forEach(el => el.remove());
    sheets = [];
    currentIndex = 0;
  }

  function makeSheet(frontHTML, backHTML, zIndexOrder) {
    const sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.style.zIndex = String(100 - zIndexOrder);

    const front = document.createElement('div');
    front.className = 'face front';
    front.innerHTML = frontHTML;

    const back = document.createElement('div');
    back.className = 'face back';
    back.innerHTML = backHTML;

    sheet.appendChild(front);
    sheet.appendChild(back);

    sheet.addEventListener('transitionstart', () => {
      sheet.classList.add('flipping');
    });
    sheet.addEventListener('transitionend', () => {
      sheet.classList.remove('flipping');
    });

    bookEl.appendChild(sheet);
    sheets.push(sheet);
  }

  function buildBook() {
    clearSheets();

    const coverSrc = imagePaths[0];

    // group remaining images into [left, right] spreads
    const spreads = [];
    for (let i = 1; i < imagePaths.length; i += 2) {
      spreads.push([
        imagePaths[i],
        imagePaths[i + 1] || null
      ]);
    }

    // Sheet 0: cover front, blank back
    makeSheet(
      `<div class="cover-image" style="background-image:url('${coverSrc}')"></div>`,
      `<div class="spread">
         <div class="spread-page"></div>
         <div class="spread-page"></div>
       </div>`,
      0
    );

    // Remaining sheets: 2-image spreads
    spreads.forEach((pair, idx) => {
      const [left, right] = pair;
      makeSheet(
        `<div class="spread">
           <div class="spread-page" style="${left ? `background-image:url('${left}')` : ''}"></div>
           <div class="spread-page" style="${right ? `background-image:url('${right}')` : ''}"></div>
         </div>`,
        `<div class="spread"></div>`,
        idx + 1
      );
    });

    currentIndex = 0;
    syncArrows();
  }

  function syncArrows(){
    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex >= sheets.length - 1);
  }

  function goNext(){
    if (currentIndex >= sheets.length - 1) return;
    const sheet = sheets[currentIndex];
    sheet.classList.add('flipped');
    currentIndex++;
    syncArrows();
  }

  function goPrev(){
    if (currentIndex <= 0) return;
    currentIndex--;
    const sheet = sheets[currentIndex];
    sheet.classList.remove('flipped');
    syncArrows();
  }

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  (async function init(){
    await setRatioFromFirst(imagePaths[0]);
    buildBook();
  })();
});
