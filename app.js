// ===== Loading Management =====
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const mainContent = document.getElementById('main-content');

const STANDARD_MEMES = [
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

const LINK_GEN_MEMES = [
  'connecting to link gen',
  'generating link',
  'checking your filter'
];

function showLoading(text, duration = 2000) {
  loadingText.textContent = text;
  loadingOverlay.classList.remove('hidden');
  return new Promise(resolve => {
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      resolve();
    }, duration);
  });
}

function showStandardLoading() {
  const meme = STANDARD_MEMES[Math.floor(Math.random() * STANDARD_MEMES.length)];
  return showLoading(meme);
}

// ===== Initial Load =====
async function init() {
  // Site loading on first access
  await showLoading('deploying proxy (this might take a sec)', 1500);
  await showLoading('striping headers', 1000);
  await showLoading('blocking ads and cookies', 800);
  await showLoading('revving the engine', 700);

  mainContent.classList.remove('hidden');
  renderFilters();
}

// ===== Filter Selection =====
const FILTERS = [
  { id: 'linewize', name: 'Linewize' },
  { id: 'lightspeed', name: 'Lightspeed' },
  { id: 'dyknow', name: 'Dyknow Cloud' },
  { id: 'senso', name: 'Senso Cloud' },
  { id: 'goguardian', name: 'Go Guardian' },
  { id: 'securly', name: 'Securly' },
  { id: 'contentkeeper', name: 'ContentKeeper' },
  { id: 'iboss', name: 'iBoss' },
  { id: 'bark', name: 'Bark' },
  { id: 'cleanbrowsing', name: 'CleanBrowsing' },
  { id: 'netnanny', name: 'Net Nanny' },
  { id: 'cyberpatrol', name: 'Cyber Patrol' },
  { id: 'clean_surf', name: 'Clean Surf' },
  { id: 'bess', name: 'Bess Internet Filtering' },
  { id: 'lanschool', name: 'LanSchool' },
  { id: 'aristotle', name: 'AristotleK12' },
  { id: 'altavista', name: 'Altavista' },
  { id: 'webfilter', name: 'WebFilter' }
];

let selectedFilter = null;
let currentLink = null;
let linkAttempts = 0;
const MAX_ATTEMPTS = 10;

function renderFilters() {
  const grid = document.getElementById('filter-grid');
  grid.innerHTML = '';
  FILTERS.forEach(f => {
    const card = document.createElement('div');
    card.className = 'filter-card';
    card.textContent = f.name;
    card.dataset.filterId = f.id;
    card.dataset.filterName = f.name;
    card.addEventListener('click', () => selectFilter(f, card));
    grid.appendChild(card);
  });
}

function selectFilter(filter, card) {
  document.querySelectorAll('.filter-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedFilter = filter;

  setTimeout(() => {
    startLinkGeneration();
  }, 400);
}

// ===== Link Generation =====
async function startLinkGeneration() {
  document.getElementById('filter-selection').classList.add('hidden');
  const inbox = document.getElementById('inbox-container');
  inbox.classList.remove('hidden');
  document.getElementById('link-result').classList.add('hidden');
  linkAttempts = 0;

  await generateAndValidateLink();
}

async function generateAndValidateLink() {
  const inboxText = document.getElementById('inbox-text');
  const linkResult = document.getElementById('link-result');
  const generatedLink = document.getElementById('generated-link');

  // Cycle through link gen loading texts
  for (const text of LINK_GEN_MEMES) {
    inboxText.textContent = text;
    await new Promise(r => setTimeout(r, 1200));
  }

  // Check if link gen is enabled
  const { data: settings } = await faSupabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'link_gen_enabled')
    .single();

  if (settings && settings.value === 'false') {
    inboxText.textContent = 'link generator is currently disabled';
    return;
  }

  // Fetch a link for the selected filter
  const { data: links, error } = await faSupabase
    .from('unblocker_links')
    .select('*')
    .eq('filter_name', selectedFilter.name)
    .eq('status', 'active')
    .order('strength', { ascending: false });

  if (error || !links || links.length === 0) {
    inboxText.textContent = 'no links available for this filter';
    return;
  }

  // Use GN Math to validate (simulated — replace with actual GN Math check)
  let validLink = null;
  for (const link of links) {
    const isUnblocked = await checkLinkWithGNMath(link.url, selectedFilter.name);
    if (isUnblocked) {
      validLink = link;
      break;
    } else {
      // Decrease strength
      await faSupabase
        .from('unblocker_links')
        .update({ strength: Math.max(0, link.strength - 1) })
        .eq('id', link.id);
    }
  }

  if (!validLink) {
    inboxText.textContent = 'all links exhausted for this filter';
    return;
  }

  currentLink = validLink;
  inboxText.textContent = 'link ready!';
  generatedLink.href = validLink.url;
  linkResult.classList.remove('hidden');
}

async function checkLinkWithGNMath(url, filterName) {
  // In production, this would call the GN Math API or use their embedding logic.
  // For now, we simulate a check.
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate 70% success rate
      resolve(Math.random() > 0.3);
    }, 800);
  });
}

// ===== Feedback Buttons =====
document.getElementById('works-btn').addEventListener('click', () => {
  if (currentLink) {
    faSupabase
      .from('unblocker_links')
      .update({ strength: currentLink.strength + 1 })
      .eq('id', currentLink.id);
  }
  document.getElementById('inbox-text').textContent = 'link confirmed working!';
});

document.getElementById('broken-btn').addEventListener('click', async () => {
  if (currentLink) {
    await faSupabase
      .from('unblocker_links')
      .update({ strength: Math.max(0, currentLink.strength - 2) })
      .eq('id', currentLink.id);
  }
  linkAttempts++;
  if (linkAttempts >= MAX_ATTEMPTS) {
    document.getElementById('inbox-text').textContent = 'max attempts reached';
    return;
  }
  document.getElementById('link-result').classList.add('hidden');
  await generateAndValidateLink();
});

// ===== Admin Access =====
let adminHoldTimer = null;
const adminTrigger = document.getElementById('admin-trigger');
const adminModal = document.getElementById('admin-modal');
const adminAuth = document.getElementById('admin-auth');

adminTrigger.addEventListener('mousedown', () => {
  adminHoldTimer = setTimeout(() => {
    adminModal.classList.remove('hidden');
  }, 3000);
});

adminTrigger.addEventListener('mouseup', () => clearTimeout(adminHoldTimer));
adminTrigger.addEventListener('mouseleave', () => clearTimeout(adminHoldTimer));

document.getElementById('admin-submit').addEventListener('click', async () => {
  const code = document.getElementById('admin-code-input').value;
  if (code === '404') {
    // In-box site loading
    adminModal.classList.add('hidden');
    await showLoading('deploying proxy (this might take a sec)', 1500);
    adminAuth.classList.remove('hidden');
  } else {
    document.getElementById('admin-code-input').value = '';
    document.getElementById('admin-code-input').placeholder = 'wrong code';
  }
});

// Admin login
document.getElementById('admin-login-btn').addEventListener('click', async () => {
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  const { data, error } = await faSupabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert('Login failed: ' + error.message);
    return;
  }

  // Check if user is admin
  const { data: profile } = await faSupabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single();

  if (!profile || !profile.is_admin) {
    alert('Access denied. Admin only.');
    await faSupabase.auth.signOut();
    return;
  }

  adminAuth.classList.add('hidden');
  document.getElementById('main-content').classList.add('hidden');
  document.getElementById('admin-suite').classList.remove('hidden');
  loadAdminSuite();
});

// ===== Admin Suite Logic =====
async function loadAdminSuite() {
  await loadLinks();
  await loadAccounts();
  await loadSettings();
}

async function loadLinks() {
  const { data: links } = await faSupabase
    .from('unblocker_links')
    .select('*')
    .order('filter_name');

  const tbody = document.querySelector('#links-table tbody');
  tbody.innerHTML = '';

  (links || []).forEach(link => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${link.filter_name}</td>
      <td><a href="${link.url}" target="_blank">${link.url.slice(0, 40)}...</a></td>
      <td>${link.status} (strength: ${link.strength})</td>
      <td>
        <button class="delete-link" data-id="${link.id}">Delete</button>
        <button class="toggle-link" data-id="${link.id}" data-status="${link.status}">
          ${link.status === 'active' ? 'Disable' : 'Enable'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Event listeners
  tbody.querySelectorAll('.delete-link').forEach(btn => {
    btn.addEventListener('click', async () => {
      await faSupabase.from('unblocker_links').delete().eq('id', btn.dataset.id);
      loadLinks();
    });
  });

  tbody.querySelectorAll('.toggle-link').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newStatus = btn.dataset.status === 'active' ? 'disabled' : 'active';
      await faSupabase.from('unblocker_links').update({ status: newStatus }).eq('id', btn.dataset.id);
      loadLinks();
    });
  });
}

async function loadAccounts() {
  const { data: profiles } = await faSupabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const tbody = document.querySelector('#accounts-table tbody');
  tbody.innerHTML = '';

  (profiles || []).forEach(profile => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${profile.email || 'N/A'}</td>
      <td>${profile.provider || 'email'}</td>
      <td>${profile.suspended ? 'Suspended' : 'Active'}</td>
      <td>
        <button class="suspend-btn" data-id="${profile.id}" data-suspended="${profile.suspended}">
          ${profile.suspended ? 'Unsuspend' : 'Suspend'}
        </button>
        <button class="delete-account-btn" data-id="${profile.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.suspend-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newSuspended = btn.dataset.suspended === 'true' ? false : true;
      await faSupabase.from('profiles').update({ suspended: newSuspended }).eq('id', btn.dataset.id);
      loadAccounts();
    });
  });

  tbody.querySelectorAll('.delete-account-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this account?')) {
        await faSupabase.from('profiles').delete().eq('id', btn.dataset.id);
        loadAccounts();
      }
    });
  });
}

async function loadSettings() {
  const { data: settings } = await faSupabase
    .from('admin_settings')
    .select('*');

  const toggle = document.getElementById('link-gen-enabled');
  const linkGenSetting = (settings || []).find(s => s.key === 'link_gen_enabled');
  if (linkGenSetting) toggle.checked = linkGenSetting.value === 'true';

  document.getElementById('save-settings-btn').onclick = async () => {
    await faSupabase
      .from('admin_settings')
      .upsert({ key: 'link_gen_enabled', value: toggle.checked ? 'true' : 'false' });
    alert('Settings saved!');
  };
}

// Add new link
document.getElementById('add-link-btn')?.addEventListener('click', async () => {
  const filterName = document.getElementById('new-link-filter').value;
  const url = document.getElementById('new-link-url').value;
  const notes = document.getElementById('new-link-notes').value;

  if (!url) return;

  await faSupabase.from('unblocker_links').insert({
    filter_name: filterName,
    url,
    notes,
    status: 'active',
    strength: 5
  });

  document.getElementById('new-link-url').value = '';
  document.getElementById('new-link-notes').value = '';
  loadLinks();
});

// ===== Start =====
init();
