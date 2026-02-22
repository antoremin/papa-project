const MIN_SIZE = 30;
const MAX_SIZE = 400;
const ZOOM_STEP = 25;

let cellSize = 60;
let galleryEl;
let sliderEl;
let onPhotoClick;

const revealObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  }
}, { rootMargin: '50px', threshold: 0.01 });

function calcFitSize(count) {
  const gap = 2;
  const vw = window.innerWidth;
  const vh = window.innerHeight - 70;
  const minCell = vw < 500 ? 36 : 40;

  for (let s = 120; s >= minCell; s--) {
    const cols = Math.floor((vw + gap) / (s + gap));
    const rows = Math.ceil(count / cols);
    if (rows * (s + gap) - gap <= vh) return s;
  }
  return minCell;
}

function setZoom(size, updateSlider = true) {
  cellSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(size)));
  if (updateSlider) sliderEl.value = cellSize;

  const root = document.documentElement.style;
  root.setProperty('--cell-size', cellSize + 'px');
  root.setProperty('--grid-gap', (cellSize < 60 ? 2 : cellSize < 120 ? 3 : cellSize < 200 ? 6 : 10) + 'px');

  galleryEl.classList.remove('zoom-xs', 'zoom-sm', 'zoom-md', 'zoom-lg');
  if (cellSize < 80)       galleryEl.classList.add('zoom-xs');
  else if (cellSize < 160) galleryEl.classList.add('zoom-sm');
  else if (cellSize < 280) galleryEl.classList.add('zoom-md');
  else                     galleryEl.classList.add('zoom-lg');
}

export function buildGallery(photos, clickHandler) {
  galleryEl = document.getElementById('gallery');
  sliderEl = document.getElementById('zoom-slider');
  onPhotoClick = clickHandler;

  const frag = document.createDocumentFragment();

  photos.forEach((photo, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('role', 'listitem');
    item.style.animationDelay = `${Math.min(i * 3, 500)}ms`;

    const img = document.createElement('img');
    img.src = photo.thumb;
    img.alt = `Photo ${i + 1}`;
    img.loading = i < 24 ? 'eager' : 'lazy';
    img.decoding = 'async';

    item.appendChild(img);
    item.addEventListener('click', () => onPhotoClick(i));
    frag.appendChild(item);
  });

  galleryEl.appendChild(frag);
  galleryEl.querySelectorAll('.gallery-item').forEach(el => revealObserver.observe(el));

  const fitSize = calcFitSize(photos.length);
  sliderEl.min = MIN_SIZE;
  sliderEl.max = MAX_SIZE;
  setZoom(fitSize);
}

export function initZoomControls() {
  const btnIn  = document.getElementById('zoom-in');
  const btnOut = document.getElementById('zoom-out');

  sliderEl.addEventListener('input', () => {
    requestAnimationFrame(() => setZoom(parseInt(sliderEl.value), false));
  });

  btnIn.addEventListener('click',  () => setZoom(cellSize + ZOOM_STEP));
  btnOut.addEventListener('click', () => setZoom(cellSize - ZOOM_STEP));

  galleryEl.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(cellSize - e.deltaY * 0.5);
    }
  }, { passive: false });

  let pinchDist = 0;
  galleryEl.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist = Math.hypot(dx, dy);
    }
  }, { passive: true });

  galleryEl.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      setZoom(cellSize + (d - pinchDist) * 0.25);
      pinchDist = d;
    }
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const fit = calcFitSize(galleryEl.children.length);
      if (cellSize <= fit + 10) setZoom(fit);
    }, 200);
  });

  if ('orientation' in screen) {
    screen.orientation.addEventListener('change', () => {
      setTimeout(() => setZoom(calcFitSize(galleryEl.children.length)), 100);
    });
  }
}
