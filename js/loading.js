// Standard loader used by the link gen (and reused by the arcade).
const MEMES = [
  'lights peed',
  '"huh"-peetzah',
  'filters cant stop me, can they?',
  'improving vital testing equipment',
  'this is for your own safety',
  'you probably shouldnt do that',
  'high score, low GPA',
  'you know what else is massive?',
  'initializing',
  'authenticating teacher portal',
  'time to fly',
  'did you hear that too?'
];

const LINKGEN_STEPS = [
  'connecting to link gen',
  'generating link',
  'checking your filter'
];

const SITE_STEPS = [
  'deploying proxy (this might take a sec)',
  'striping headers',
  'blocking ads and cookies',
  'revving the engine'
];

let memeTimer = null;
let stepTimer = null;

const $loader = document.getElementById('loader');
const $caption = document.getElementById('loader-caption');

export const Loading = {
  show(caption = 'initializing') {
    $caption.textContent = caption;
    $loader.classList.remove('hidden');
  },
  hide() { $loader.classList.add('hidden'); },
  setCaption(text) {
    $caption.classList.add('fade');
    setTimeout(() => { $caption.textContent = text; $caption.classList.remove('fade'); }, 150);
  },
  /** Standard loading — cycles meme captions. */
  startStandard() {
    this.show();
    let i = Math.floor(Math.random() * MEMES.length);
    this.setCaption(MEMES[i]);
    clearInterval(memeTimer);
    memeTimer = setInterval(() => {
      i = (i + 1) % MEMES.length;
      this.setCaption(MEMES[i]);
    }, 1800);
  },
  /** Link generating — cycles link-gen steps. */
  startLinkGen() {
    this.show();
    let i = 0;
    this.setCaption(LINKGEN_STEPS[0]);
    clearInterval(stepTimer);
    stepTimer = setInterval(() => {
      i = Math.min(i + 1, LINKGEN_STEPS.length - 1);
      this.setCaption(LINKGEN_STEPS[i]);
    }, 1200);
  },
  /** Site loading — for the arcade proxy. */
  startSite() {
    this.show();
    let i = 0;
    this.setCaption(SITE_STEPS[0]);
    clearInterval(stepTimer);
    stepTimer = setInterval(() => {
      i = (i + 1) % SITE_STEPS.length;
      this.setCaption(SITE_STEPS[i]);
    }, 1400);
  },
  stop() {
    clearInterval(memeTimer);
    clearInterval(stepTimer);
    this.hide();
  }
};

// Random meme picker for arcade cold-boot
export const randomMeme = () => MEMES[Math.floor(Math.random() * MEMES.length)];
