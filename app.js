// ===== Loading Management =====
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const mainContent = document.getElementById('main-content');

const STANDARD_MEMES = [
  'lights peed', '"huh"-peetzah', 'filters cant stop me, can they?',
  'improving vital testing equipment', 'this is for your own safety',
  'you probably shouldnt do that', 'high score, low GPA',
  'you know what else is massive?', 'initializing',
  'authenticating teacher portal', 'time to fly', 'did you hear that too?'
];
const LINK_GEN_MEMES = ['connecting to link gen', 'generating link', 'checking your filter'];

function showLoading(text, duration = 2000) {
  loadingText.textContent = text;
  loadingOverlay.classList.remove('hidden');
  return new Promise(resolve => setTimeout(() => { loadingOverlay.classList.add('hidden'); resolve(); }, duration));
}
function showStandardLoading() {
  return showLoading(STANDARD_MEMES[Math.floor(Math.random() * STANDARD_MEMES.length)]);
}

// ===== Initial Load =====
async function init() {
  await showLoading('deploying proxy (this might take a sec)', 1500);
  await showLoading('striping headers', 1000);
  await showLoading('blocking ads and cookies', 800);
  await showLoading('revving the engine', 700);
  mainContent.classList.remove('hidden');
  renderFilters();
}

// ===== Filter Selection =====
const FILTERS = [
  { id: 'linewize', name: 'Linewize' }, { id: 'lightspeed', name: 'Lightspeed' },
  { id: 'dyknow', name: 'Dyknow Cloud' }, { id: 'senso', name: 'Senso Cloud' },
  { id: 'goguardian', name: 'Go Guardian' }, { id: 'securly', name: 'Securly' },
  { id: 'contentkeeper', name: 'ContentKeeper' }, { id: 'iboss', name: 'iBoss' },
  { id: 'bark', name: 'Bark' }, { id: 'cleanbrowsing', name: 'CleanBrowsing' },
  { id: 'netnanny', name: 'Net Nanny' }, { id: 'cyberpatrol', name: 'Cyber Patrol' },
  { id: 'lanschool', name: 'LanSchool' }, { id: 'aristotle', name: 'AristotleK12' }
];
let selectedFilter = null;
let currentLink = null;

function renderFilters() {
  const grid = document.getElementById('filter-grid');
  const select = document.getElementById('new-link-filter');
  grid.innerHTML = ''; select.innerHTML = '';
  FILTERS.forEach(f => {
    const card = document.createElement('div');
    card.className = 'filter-card'; card.textContent = f.name;
    card.addEventListener('click', () => {
      document.querySelectorAll('.filter-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedFilter = f;
      setTimeout(() => { document.getElementById('filter-selection').classList.add('hidden'); startLinkGeneration(); }, 400);
    });
    grid.appendChild(card);
    const option = document.createElement('option'); option.value = f.name; option.textContent = f.name; select.appendChild(option);
  });
}

// ===== Link Generation =====
async function startLinkGeneration() {
  const inbox = document.getElementById('inbox-container');
  inbox.classList.remove('hidden');
  document.getElementById('link-result').classList.add('hidden');
  await generateAndValidateLink();
}

async function generateAndValidateLink() {
  const inboxText = document.getElementById('inbox-text');
  const linkResult = document.getElementById('link-result');
  const generatedLink = document.getElementById('generated-link');

  for (const text of LINK_GEN_MEMES) {
    inboxText.textContent = text;
    await new Promise(r => setTimeout(r, 1200));
  }

  const { data: links, error } = await faSupabase.from('unblocker_links').select('*').eq('filter_name', selectedFilter.name).eq('status', 'active');
  if (error || !links || links.length === 0) { inboxText.textContent = 'no links available for this filter'; return; }

  // Simulate GN Math check (replace with actual logic if needed)
  let validLink = links[0]; // For now, just pick the first one
  currentLink = validLink;
  inboxText.textContent = 'link ready!';
  generatedLink.href = validLink.url;
  linkResult.classList.remove('hidden');
}

document.getElementById('get-link-btn').addEventListener('click', async () => {
  document.getElementById('get-link-btn').classList.add('hidden');
  await showStandardLoading();
  document.getElementById('filter-selection').classList.remove('hidden');
});

// ===== Feedback Buttons =====
document.getElementById('works-btn').addEventListener('click', () => {
  if (currentLink) faSupabase.from('unblocker_links').update({ strength: currentLink.strength + 1 }).eq('id', currentLink.id);
  document.getElementById('inbox-text').textContent = 'link confirmed working!';
});
document.getElementById('broken-btn').addEventListener('click', async () => {
  if (currentLink) await faSupabase.from('unblocker_links').update({ strength: Math.max(0, currentLink.strength - 2) }).eq('id', currentLink.id);
  document.getElementById('link-result').classList.add('hidden');
  await generateAndValidateLink();
});

// ===== Admin Access =====
let adminHoldTimer = null;
const adminTrigger = document.getElementById('admin-trigger');
adminTrigger.addEventListener('mousedown', () => { adminHoldTimer = setTimeout(() => document.getElementById('admin-modal').classList.remove('hidden'), 3000); });
adminTrigger.addEventListener('mouseup', () => clearTimeout(adminHoldTimer));
adminTrigger.addEventListener('mouseleave', () => clearTimeout(adminHoldTimer));

document.getElementById('admin-submit').addEventListener('click', async () => {
  if (document.getElementById('admin-code-input').value === '404') {
    document.getElementById('admin-modal').classList.add('hidden');
    await showLoading('deploying proxy (this might take a sec)', 1500);
    document.getElementById('admin-auth').classList.remove('hidden');
  } else {
    document.getElementById('admin-code-input').value = '';
    document.getElementById('admin-code-input').placeholder = 'wrong code';
  }
});

document.getElementById('admin-login-btn').addEventListener('click', async () => {
  const { data, error } = await faSupabase.auth.signInWithPassword({ email: document.getElementById('admin-email').value, password: document.getElementById('admin-password').value });
  if (error) return alert(error.message);
  const { data: profile } = await faSupabase.from('profiles').select('is_admin').eq('id', data.user.id).single();
  if (!profile || !profile.is_admin) { alert('Access denied.'); await faSupabase.auth.signOut(); return; }
  document.getElementById('admin-auth').classList.add('hidden');
  document.getElementById('main-content').classList.add('hidden');
  document.getElementById('admin-suite').classList.remove('hidden');
  loadAdminSuite();
});

document.getElementById('admin-github-btn').addEventListener('click', async () => {
  await faSupabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } });
});

// ===== Admin Suite Logic =====
async function loadAdminSuite() {
  const { data: links } = await faSupabase.from('unblocker_links').select('*').order('filter_name');
  const tbody = document.querySelector('#links-table tbody'); tbody.innerHTML = '';
  (links || []).forEach(link => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${link.filter_name}</td><td>${link.url.slice(0, 30)}...</td><td>${link.status}</td>
      <td><button onclick="deleteLink(${link.id})">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}
window.deleteLink = async (id) => { await faSupabase.from('unblocker_links').delete().eq('id', id); loadAdminSuite(); };

document.getElementById('add-link-btn').addEventListener('click', async () => {
  const filterName = document.getElementById('new-link-filter').value;
  const url = document.getElementById('new-link-url').value;
  if (!url) return;
  await faSupabase.from('unblocker_links').insert({ filter_name: filterName, url, status: 'active', strength: 5 });
  document.getElementById('new-link-url').value = '';
  loadAdminSuite();
});

init();
