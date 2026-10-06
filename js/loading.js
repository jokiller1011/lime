// ============================================
// LOADING SYSTEM
// ============================================

import { STANDARD_MEMES, SITE_LOADING_TEXTS, LINK_GEN_LOADING_TEXTS } from './config.js';

let memeInterval = null;
let textInterval = null;

function getRandomMeme() {
  return STANDARD_MEMES[Math.floor(Math.random() * STANDARD_MEMES.length)];
}

export function showLoading(overlayId, textId, mode = 'standard') {
  const overlay = document.getElementById(overlayId || 'loading-overlay');
  const textEl = document.getElementById(textId || 'loading-text');
  if (!overlay) return;

  overlay.classList.remove('hidden');

  let texts;
  switch (mode) {
    case 'site':      texts = SITE_LOADING_TEXTS; break;
    case 'link-gen':  texts = LINK_GEN_LOADING_TEXTS; break;
    default:          texts = [getRandomMeme()]; break;
  }

  let idx = 0;
  textEl.textContent = texts[0];

  // For site/link-gen, cycle through specific texts; for standard, cycle memes
  if (mode === 'site' || mode === 'link-gen') {
    textInterval = setInterval(() => {
      idx = (idx + 1) % texts.length;
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = texts[idx];
        textEl.style.opacity = '1';
      }, 200);
    }, 1800);
  } else {
    memeInterval = setInterval(() => {
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = getRandomMeme();
        textEl.style.opacity = '1';
      }, 200);
    }, 2200);
  }
}

export function hideLoading(overlayId) {
  const overlay = document.getElementById(overlayId || 'loading-overlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  clearInterval(memeInterval);
  clearInterval(textInterval);
  memeInterval = null;
  textInterval = null;
}

export function showInBoxLoading(containerId, text) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const loadingEl = container.querySelector('.in-box-loading-anim');
  const contentEl = container.querySelector('.link-box-content');
  const textEl = container.querySelector('.in-box-text');

  if (contentEl) contentEl.classList.add('hidden');
  if (loadingEl) loadingEl.classList.remove('hidden');
  if (textEl) textEl.textContent = text;

  // Cycle through memes
  let memeIdx = 0;
  const memes = [...STANDARD_MEMES].sort(() => Math.random() - 0.5);
  const interval = setInterval(() => {
    if (!container.contains(loadingEl) || loadingEl.classList.contains('hidden')) {
      clearInterval(interval);
      return;
    }
    if (textEl) {
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = memes[memeIdx % memes.length];
        textEl.style.opacity = '1';
        memeIdx++;
      }, 200);
    }
  }, 1500);
}

export function hideInBoxLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const loadingEl = container.querySelector('.in-box-loading-anim');
  const contentEl = container.querySelector('.link-box-content');

  if (loadingEl) loadingEl.classList.add('hidden');
  if (contentEl) contentEl.classList.remove('hidden');
}
