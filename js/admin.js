import { supabase, signInWithDiscord, signInWithGithub, isAdmin } from './supabase.js';

const HOLD_MS = 3000;

const $trigger   = document.getElementById('admin-trigger');
const $authModal = document.getElementById('admin-auth');
const $authCancel= document.getElementById('admin-auth-cancel');
const $discord   = document.getElementById('oauth-discord');
const $github    = document.getElementById('oauth-github');
const $suite     = document.getElementById('admin-suite');
const $close     = document.getElementById('admin-close');

const tabs      = document.querySelectorAll('.admin-tabs .tab');
const panes     = document.querySelectorAll('.tab-pane');

// ── Long-press on bottom-right corner ──────────────────────
let holdTimer = null;
function startHold() {
  holdTimer = setTimeout(async () => {
    if (await isAdmin()) openSuite();
    else $authModal.classList.remove('hidden');
  }, HOLD_MS);
}
function cancelHold() { clearTimeout(holdTimer); }

['mousedown','touchstart'].forEach(ev => $trigger.addEventListener(ev, startHold, { passive: true }));
['mouseup','mouseleave','touchend','touchcancel'].forEach(ev => $trigger.addEventListener(ev, cancelHold));

// ── Auth ───────────────────────────────────────────────────
$discord.addEventListener('click', signInWithDiscord);
$github .addEventListener('click', signInWithGithub);
$authCancel.addEventListener('click', () => $authModal.classList.add('hidden'));

supabase.auth.onAuthStateChange(async (evt) => {
  if (evt === 'SIGNED_IN' && await isAdmin()) {
    $authModal.classList.add('hidden');
    openSuite();
  }
});

// ── Suite ──────────────────────────────────────────────────
function openSuite() {
  $suite.classList.remove('hidden');
  loadLinks();
  loadReports();
  loadConfig();
}
$close.addEventListener('click', () => $suite.classList.add('hidden'));

tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.toggle('active', x === t));
  panes.forEach(p => p.classList.toggle('active', p.dataset.pane === t.dataset.tab));
}));

// ── Links tab ──────────────────────────────────────────────
async function loadLinks() {
  const { data } = await supabase.from('links').select('*').order('created_at', { ascending: false });
  const tbody = document.querySelector('#links-table tbody');
  tbody.innerHTML = '';
  (data ?? []).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.url}</td>
      <td>${row.filter_name}</td>
      <td>${row.strength}</td>
      <td>${row.enabled ? 'enabled' : 'disabled'}</td>
      <td><button data-id="${row.id}" class="btn-ghost toggle">${row.enabled ? 'Disable' : 'Enable'}</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.toggle').forEach(btn => btn.addEventListener('click', async () => {
    const id = btn.dataset.id;
    const { data: row } = await supabase.from('links').select('enabled').eq('id', id).single();
    await supabase.from('links').update({ enabled: !row.enabled }).eq('id', id);
    loadLinks();
  }));
}

document.getElementById('add-link-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url    = document.getElementById('new-link-url').value.trim();
  const filter = document.getElementById('new-link-filter').value;
  const str    = parseInt(document.getElementById('new-link-strength').value || '0', 10);
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('links').insert({ url, filter_name: filter, strength: str, added_by: user.id });
  e.target.reset();
  loadLinks();
});

// ── Reports tab ────────────────────────────────────────────
async function loadReports() {
  const { data } = await supabase
    .from('link_reports')
    .select('*, links(url)')
    .order('created_at', { ascending: false })
    .limit(200);
  const tbody = document.querySelector('#reports-table tbody');
  tbody.innerHTML = '';
  (data ?? []).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.links?.url ?? '(deleted)'}</td>
      <td>${r.filter_name ?? '—'}</td>
      <td>${r.blocked ? 'blocked' : 'worked'}</td>
      <td>${new Date(r.created_at).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });
}

// ── Config tab ─────────────────────────────────────────────
async function loadConfig() {
  const { data } = await supabase.from('app_config').select('value').eq('key','linkgen_enabled').single();
  document.getElementById('toggle-linkgen').checked = data?.value !== false;
}
document.getElementById('toggle-linkgen').addEventListener('change', async (e) => {
  await supabase.from('app_config').update({ value: e.target.checked, updated_at: new Date().toISOString() })
    .eq('key','linkgen_enabled');
});
