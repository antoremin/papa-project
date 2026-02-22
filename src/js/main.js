import { buildGallery, initZoomControls } from './gallery.js';
import { initLightbox, openLightbox } from './lightbox.js';

async function init() {
  const res = await fetch('./photos/manifest.json');
  const photos = await res.json();

  initLightbox(photos);
  buildGallery(photos, openLightbox);
  initZoomControls();
}

init();
