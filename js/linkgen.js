import { supabase } from './supabase.js';
import { Loading } from './loading.js';
import { ARCADE_BASE } from './config.js';

const $generate   = document.getElementById('generate-btn');
const $status     = document.getElementById('linkgen-status');
const $result     = document.getElementById('result');
const $resultLink = document.getElementById('result-link');
const $copy       = document.getElementById('copy-btn');
const $open       = document.getElementById('open-btn');
const $worked     = document.getElementById('worked-btn');
const $blocked    = document.getElementById('blocked-btn');

const $modal       = document.getElementById('filter-modal');
const $filterCancel= document.getElementById('filter-cancel');
const filterOpts   = document.querySelectorAll('.filter-opt');

let chosenFilter = null;
let currentLink  = null;
let attempts     = 0;

async function linkGenEnabled() {
  const { data } = await supabase.from('app_config').select('value').eq('key','linkgen_enabled').single();
  return data?.value !== false;
}

async function pickBestLink(filter) {
  // Prefer links matching the filter, then 'any'. Lowest strength first (easiest).
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('enabled', true)
    .in('filter_name', [filter, 'any'])
    .order('strength', { ascending: true })
    .order('created_at', { ascending: true });
  if (error || !data?.length) return null;

  // Round-robin by attempt count so we don't hand out the same one twice in a row
  const idx = Math.min(attempts, data.length - 1);
  return data[idx];
}

function buildLink(row) {
  const u = new URL(row.url);
  // Anchor attempt tracking so worker can log hit rate
  u.searchParams.set('fa_src', 'linkgen');
  u.searchParams.set('fa_filter', chosenFilter);
  u.searchParams.set('fa_attempt', String(attempts));
  return u.toString();
}

function showResult(url) {
  currentLink = url;
  $resultLink.value = url;
  $result.classList.remove('hidden');
  $status.textContent = 'Open it, then tell us if it worked.';
}

async function generate() {
  const enabled = await linkGenEnabled();
  if (!enabled) { $status.textContent = 'Link gen is currently disabled.'; return; }

  Loading.startLinkGen();
  const row = await pickBestLink(chosenFilter);
  await new Promise(r => setTimeout(r, 2200)); // let the captions breathe
  Loading.stop();

  if (!row) {
    $status.textContent = 'No links available for your filter yet. Try again soon.';
    return;
  }
  showResult(buildLink(row));
}

async function report(blocked) {
  if (!currentLink) return;
  // Extract the raw link id we picked (looked up by URL match in table)
  const { data } = await supabase.from('links').select('id').eq('enabled', true).limit(50);
  // simple match: find row whose url appears in currentLink
  let matched = null;
  for (const r of (data ?? [])) {
    if (currentLink.includes(r.url)) { matched = r; break; }
  }
  await supabase.from('link_reports').insert({
    link_id: matched?.id ?? null,
    filter_name: chosenFilter,
    blocked
  });

  if (blocked) {
    attempts++;
    $result.classList.add('hidden');
    $status.textContent = 'Got it — finding a stronger link for your filter…';
    generate();
  } else {
    $status.textContent = 'Awesome. Enjoy Freedom’s Arcade.';
    $result.classList.add('hidden');
  }
}

export function initLinkGen() {
  $generate.addEventListener('click', () => {
    attempts = 0;
    $modal.classList.remove('hidden');
  });

  $filterCancel.addEventListener('click', () => $modal.classList.add('hidden'));

  filterOpts.forEach(btn => btn.addEventListener('click', () => {
    chosenFilter = btn.dataset.filter;
    $modal.classList.add('hidden');
    generate();
  }));

  $copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(currentLink);
    $copy.textContent = 'Copied!';
    setTimeout(() => $copy.textContent = 'Copy', 1200);
  });
  $open.addEventListener('click', () => window.open(currentLink, '_blank'));

  $worked .addEventListener('click', () => report(false));
  $blocked.addEventListener('click', () => report(true));
}
