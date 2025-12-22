document.addEventListener('DOMContentLoaded', () => {
  const bookEl  = document.getElementById('book');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // >>> Replace with your images (page order)
  const images = [
    'images/page01.jpg',
    'images/page02.jpg',
    'images/page03.jpg',
    'images/page04.jpg',
    // ...
  ];

  let sheets = [];
  let totalPages = 0;
  let currentPage = 0; // 1-based for humans

  function clearBook(){
    bookEl.querySelectorAll('.sheet').forEach(n => n.remove());
    sheets = []; totalPages = 0; currentPage = 0;
  }

  function setRatioFromFirst(imgURL){
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        // ratio for the whole book frame (two pages side-by-side)
        const r = im.naturalHeight / (im.naturalWidth * 2);
        document.documentElement.style.setProperty('--ratio', r.toString());
        resolve();
      };
      im.onerror = () => resolve(); // keep default if it fails
      im.src = imgURL;
    });
  }

  function buildSheetsFromImages(imgs){
    const pages = imgs.slice();
    if (pages.length % 2 !== 0) pages.push(null); // pad for even count
    const pairCount = Math.ceil(pages.length / 2);
    const builtSheets = [];

    for (let p = 0; p < pairCount; p++){
      const frontSrc = pages[p*2];
      const backSrc  = pages[p*2 + 1];

      const sheet = document.createElement('div');
      sheet.className = 'sheet';
      sheet.style.zIndex = String(100 - p);

      const front = document.createElement('div');
      front.className = 'face front';
      const fimg = document.createElement('div');
      fimg.className = 'img';
      if (frontSrc) fimg.style.backgroundImage = `url("${frontSrc}")`;
      front.appendChild(fimg);

      const back = document.createElement('div');
      back.className = 'face back';
      const bimg = document.createElement('div');
      bimg.className = 'img';
      if (backSrc) bimg.style.backgroundImage = `url("${backSrc}")`;
      back.appendChild(bimg);

      sheet.appendChild(front);
      sheet.appendChild(back);

      sheet.addEventListener('transitionstart', () => sheet.classList.add('flipping'));
      sheet.addEventListener('transitionend',   () => sheet.classList.remove('flipping'));

      bookEl.appendChild(sheet);
      builtSheets.push(sheet);
    }

    sheets = builtSheets;
    totalPages = pages.length;
    currentPage = 1; // open on first page
    syncArrows();
  }

  function syncArrows(){
    prevBtn.disabled = (currentPage <= 1);
    nextBtn.disabled = (currentPage >= totalPages);
  }

  function goNext(){
    if (currentPage >= totalPages) return;
    const sheetIndex = Math.floor((currentPage - 1) / 2);
    if (currentPage % 2 === 1) sheets[sheetIndex].classList.add('flipped');
    currentPage += 1; syncArrows();
  }

  function goPrev(){
    if (currentPage <= 1) return;
    const goingTo = currentPage - 1;
    const sheetIndex = Math.floor((goingTo - 1) / 2);
    if (goingTo % 2 === 1) sheets[sheetIndex].classList.remove('flipped');
    currentPage = goingTo; syncArrows();
  }

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  // Build the book
  (async function init(){
    clearBook();
    if (images.length) await setRatioFromFirst(images[0]);
    buildSheetsFromImages(images);
  })();
});