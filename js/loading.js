// =============================================
// Freedom's Arcade v4 — Loading System
// =============================================

export const MEMES = [
  'lights peed',
  '"huh"-peetzah',
  'filters cant stop me, can they?',
  'improving vital testing equipment',
  'this is for your own safety',
  'you probably shouldn\'t do that',
  'high score, low GPA',
  'you know what else is massive?',
  'initializing',
  'authenticating teacher portal',
  'time to fly',
  'did you hear that too?',
  'loading your education'
];

export const SITE_LOADING_TEXTS = [
  'deploying proxy (this might take a sec)',
  'striping headers',
  'blocking ads and cookies',
  'revving the engine'
];

export const LINK_GEN_TEXTS = [
  'connecting to link gen',
  'generating link',
  'checking your filter'
];

let loadingOverlay = null;
let textInterval = null;
let currentMemes = MEMES;

/**
 * Create the loading overlay
 * @param {string} type - 'standard' | 'site' | 'linkgen'
 * @param {string} containerId - optional container for "in box" loading
 */
export function showLoading(type = 'standard', containerId = null) {
  if (containerId) {
    return showInBoxLoading(containerId, type);
  }

  // Remove existing
  hideLoading();

  const overlay = document.createElement('div');
  overlay.id = 'fa-loading-overlay';
  overlay.className = 'fa-loading-overlay';

  // Blur background
  const appContent = document.getElementById('app') || document.body;
  appContent.classList.add('fa-blurred');

  // Spinner
  const spinner = document.createElement('div');
  spinner.className = 'fa-spinner';
  spinner.innerHTML = `
    <div class="fa-spinner-dot"></div>
    <div class="fa-spinner-dot"></div>
    <div class="fa-spinner-dot"></div>
    <div class="fa-spinner-dot"></div>
  `;

  // Text
  const textEl = document.createElement('div');
  textEl.className = 'fa-loading-text';
  textEl.textContent = getRandomText(type);

  overlay.appendChild(spinner);
  overlay.appendChild(textEl);
  document.body.appendChild(overlay);
  loadingOverlay = overlay;

  // Rotate text
  textInterval = setInterval(() => {
    textEl.textContent = getRandomText(type);
  }, 2500);

  return { overlay, textEl, spinner };
}

function getRandomText(type) {
  let pool;
  switch (type) {
    case 'site':
      pool = SITE_LOADING_TEXTS;
      break;
    case 'linkgen':
      pool = LINK_GEN_TEXTS;
      break;
    default:
      pool = MEMES;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function hideLoading() {
  if (textInterval) {
    clearInterval(textInterval);
    textInterval = null;
  }
  if (loadingOverlay) {
    loadingOverlay.remove();
    loadingOverlay = null;
  }
  const appContent = document.getElementById('app') || document.body;
  appContent.classList.remove('fa-blurred');
}

/**
 * In-box loading — dots zooming inside a frame (space theme)
 */
export function showInBoxLoading(containerId, type = 'standard') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="fa-inbox-loading">
      <div class="fa-inbox-dots">
        <span class="fa-inbox-dot"></span>
        <span class="fa-inbox-dot"></span>
        <span class="fa-inbox-dot"></span>
        <span class="fa-inbox-dot"></span>
        <span class="fa-inbox-dot"></span>
      </div>
      <div class="fa-inbox-text">${getRandomText(type)}</div>
    </div>
  `;

  const textEl = container.querySelector('.fa-inbox-text');
  const interval = setInterval(() => {
    textEl.textContent = getRandomText(type);
  }, 2000);

  return {
    container,
    textEl,
    clear: () => clearInterval(interval)
  };
}
