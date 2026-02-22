let photos = [];
let current = 0;

let lightboxEl, imgEl, counterEl;

function show(animated) {
  imgEl.src = photos[current].full;
  counterEl.textContent = `${current + 1}\u2009/\u2009${photos.length}`;

  if (animated) {
    imgEl.onload = () => {
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1) translateX(0)';
    };
  }
}

function open(index) {
  current = index;
  show(false);
  lightboxEl.classList.add('active');
  document.body.classList.add('no-scroll');
  document.getElementById('lightbox-close').focus();
}

function close() {
  lightboxEl.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

function navigate(dir) {
  imgEl.style.opacity = '0';
  imgEl.style.transform = `scale(0.96) translateX(${dir * -20}px)`;
  setTimeout(() => {
    current = (current + dir + photos.length) % photos.length;
    show(true);
  }, 150);
}

export function initLightbox(photoList) {
  photos = photoList;
  lightboxEl = document.getElementById('lightbox');
  imgEl      = document.getElementById('lightbox-img');
  counterEl  = document.getElementById('lightbox-counter');

  document.getElementById('lightbox-close').addEventListener('click', close);
  document.getElementById('lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  document.getElementById('lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightboxEl.classList.contains('active')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  let touchX = 0, touchY = 0;
  lightboxEl.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  lightboxEl.addEventListener('touchend', (e) => {
    const dx = touchX - e.changedTouches[0].clientX;
    const dy = Math.abs(touchY - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 50 && dy < 100) navigate(dx > 0 ? 1 : -1);
  }, { passive: true });
}

export function openLightbox(index) {
  open(index);
}
