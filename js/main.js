import { Loading } from './loading.js';
import { startParticles } from './particles.js';
import { initLinkGen } from './linkgen.js';
import { supabase } from './supabase.js';

async function boot() {
  // 1. Show "Site loading" while we hydrate
  Loading.startSite();
  startParticles();

  // 2. Let Supabase finish processing the OAuth hash if present
  await supabase.auth.getSession();

  // 3. Short pause so the loader doesn't flash
  await new Promise(r => setTimeout(r, 1200));

  Loading.stop();
  document.getElementById('app').classList.remove('hidden');

  initLinkGen();
  // admin.js self-initializes on import — dynamic so it isn't in the boot hot path
  await import('./admin.js');
}
boot();
