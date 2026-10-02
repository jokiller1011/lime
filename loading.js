// loading.js
const MEMES = [
  "lights peed", "“huh”-peetzah", "filters cant stop me, can they?",
  "improving vital testing equipment", "this is for your own safety",
  "you probably shouldnt do that", "high score, low GPA",
  "you know what else is massive?", "initializing",
  "authenticating teacher portal", "time to fly", "did you hear that too?"
]

const SITE_LOADING_TEXTS = [
  "deploying proxy(this might take a sec)",
  "striping headers", "blocking ads and cookies", "revving the engine"
]

const LINK_GEN_TEXTS = [
  "connecting to link gen", "generating link", "checking your filter"
]

function createSpinner() {
  return `<div class="fa-spinner">
    <div class="fa-circle"></div><div class="fa-circle"></div>
    <div class="fa-circle"></div><div class="fa-circle"></div>
  </div>`
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export function showStandardLoading(container) {
  container.innerHTML = `
    <div class="fa-loading-overlay">
      <div class="fa-loading-backdrop"></div>
      <div class="fa-loading-content">
        ${createSpinner()}
        <p class="fa-meme">${pickRandom(MEMES)}</p>
      </div>
    </div>`
}

export function showSiteLoading(container) {
  container.innerHTML = `
    <div class="fa-loading-overlay">
      <div class="fa-loading-backdrop"></div>
      <div class="fa-loading-content">
        ${createSpinner()}
        <p class="fa-site-text">${pickRandom(SITE_LOADING_TEXTS)}</p>
      </div>
    </div>`
}

export function showLinkGenLoading(container) {
  container.innerHTML = `
    <div class="fa-loading-overlay">
      <div class="fa-loading-backdrop"></div>
      <div class="fa-loading-content">
        ${createSpinner()}
        <p class="fa-link-text">${pickRandom(LINK_GEN_TEXTS)}</p>
      </div>
    </div>`
}

export function showInBoxLoading(container, meme) {
  container.innerHTML = `
    <div class="fa-inbox-loading">
      <div class="fa-stars"></div>
      <p class="fa-meme">${meme || pickRandom(MEMES)}</p>
    </div>`
}

export function hideLoading(container) { container.innerHTML = '' }
