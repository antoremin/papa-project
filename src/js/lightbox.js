let photos = [];
let current = 0;

let lightboxEl, imgEl, counterEl, closeBtn, prevBtn, nextBtn;

function show(animated) {
  imgEl.src = photos[current].full;
  counterEl.textContent = `${current + 1}\u2009/\u2009${photos.length}`;

  if (animated) {
    imgEl.onload = () => {
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1) translate(0, 0)';
    };
  }
}

function open(index) {
  current = index;
  show(false);
  lightboxEl.classList.add('active');
  document.body.classList.add('no-scroll');
  closeBtn.focus();
}

function close() {
  lightboxEl.classList.remove('active');
  document.body.classList.remove('no-scroll');
  resetDragStyles();
}

function navigate(dir) {
  imgEl.style.opacity = '0';
  imgEl.style.transform = `scale(0.96) translateX(${dir * -30}px)`;
  setTimeout(() => {
    current = (current + dir + photos.length) % photos.length;
    show(true);
  }, 150);
}

function resetDragStyles() {
  imgEl.style.transition = '';
  imgEl.style.transform = '';
  imgEl.style.opacity = '';
  lightboxEl.style.background = '';
  counterEl.style.opacity = '';
  closeBtn.style.opacity = '';
  prevBtn.style.opacity = '';
  nextBtn.style.opacity = '';
}

export function initLightbox(photoList) {
  photos = photoList;
  lightboxEl = document.getElementById('lightbox');
  imgEl      = document.getElementById('lightbox-img');
  counterEl  = document.getElementById('lightbox-counter');
  closeBtn   = document.getElementById('lightbox-close');
  prevBtn    = document.getElementById('lightbox-prev');
  nextBtn    = document.getElementById('lightbox-next');

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl || e.target === imgEl) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightboxEl.classList.contains('active')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  initTouchGestures();
}

function initTouchGestures() {
  let startX = 0, startY = 0;
  let dx = 0, dy = 0;
  let axis = null; // 'x' | 'y' | null
  let dragging = false;
  const LOCK_THRESHOLD = 8;
  const DISMISS_THRESHOLD = 120;
  const SWIPE_THRESHOLD = 50;

  lightboxEl.addEventListener('touchstart', (e) => {
    if (!lightboxEl.classList.contains('active')) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dx = 0;
    dy = 0;
    axis = null;
    dragging = true;
    imgEl.style.transition = 'none';
  }, { passive: true });

  lightboxEl.addEventListener('touchmove', (e) => {
    if (!dragging) return;

    dx = e.touches[0].clientX - startX;
    dy = e.touches[0].clientY - startY;

    if (!axis) {
      if (Math.abs(dx) > LOCK_THRESHOLD) axis = 'x';
      else if (Math.abs(dy) > LOCK_THRESHOLD) axis = 'y';
      else return;
    }

    if (axis === 'y') {
      const absY = Math.abs(dy);
      const progress = Math.min(absY / 400, 1);
      const scale = 1 - progress * 0.15;
      const bgAlpha = 1 - progress * 0.8;
      const controlAlpha = 1 - progress * 2;

      imgEl.style.transform = `translate(0, ${dy}px) scale(${scale})`;
      lightboxEl.style.background = `rgba(0, 0, 0, ${bgAlpha})`;
      counterEl.style.opacity = Math.max(0, controlAlpha);
      closeBtn.style.opacity = Math.max(0, controlAlpha);
      prevBtn.style.opacity = Math.max(0, controlAlpha);
      nextBtn.style.opacity = Math.max(0, controlAlpha);
    }

    if (axis === 'x') {
      const dampened = dx * 0.3;
      imgEl.style.transform = `translate(${dampened}px, 0)`;
      imgEl.style.opacity = `${1 - Math.abs(dx) / 800}`;
    }
  }, { passive: true });

  lightboxEl.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;

    imgEl.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.2s ease';

    if (axis === 'y' && Math.abs(dy) > DISMISS_THRESHOLD) {
      imgEl.style.transform = `translate(0, ${dy > 0 ? '100vh' : '-100vh'}) scale(0.8)`;
      imgEl.style.opacity = '0';
      lightboxEl.style.transition = 'background 0.25s ease';
      lightboxEl.style.background = 'rgba(0, 0, 0, 0)';
      setTimeout(close, 250);
      return;
    }

    if (axis === 'x' && Math.abs(dx) > SWIPE_THRESHOLD) {
      navigate(dx > 0 ? 1 : -1);
      resetDragStyles();
      return;
    }

    imgEl.style.transform = 'scale(1) translate(0, 0)';
    imgEl.style.opacity = '1';
    lightboxEl.style.transition = 'background 0.2s ease';
    lightboxEl.style.background = '';
    counterEl.style.transition = 'opacity 0.2s ease';
    counterEl.style.opacity = '';
    closeBtn.style.transition = 'opacity 0.2s ease';
    closeBtn.style.opacity = '';
    prevBtn.style.transition = 'opacity 0.2s ease';
    prevBtn.style.opacity = '';
    nextBtn.style.transition = 'opacity 0.2s ease';
    nextBtn.style.opacity = '';

    setTimeout(() => {
      imgEl.style.transition = '';
      lightboxEl.style.transition = '';
      counterEl.style.transition = '';
      closeBtn.style.transition = '';
      prevBtn.style.transition = '';
      nextBtn.style.transition = '';
    }, 300);
  }, { passive: true });

  lightboxEl.addEventListener('touchcancel', () => {
    dragging = false;
    resetDragStyles();
  }, { passive: true });
}

export function openLightbox(index) {
  open(index);
}
