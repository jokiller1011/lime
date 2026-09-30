import { supabase } from './supabase-config.js';

// --- Meme Texts ---
const MEMES = {
  standard: [
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
  ],
  site: [
    'deploying proxy(this might take a sec)',
    'striping headers',
    'blocking ads and cookies',
    'revving the engine'
  ],
  linkGen: [
    'connecting to link gen',
    'generating link',
    'checking your filter'
  ]
};

// --- Loading Controller ---
class LoadingController {
  constructor(overlayId, textId) {
    this.overlay = document.getElementById(overlayId);
    this.textEl = document.getElementById(textId);
    this.interval = null;
  }

  show(texts) {
    this.overlay.classList.remove('hidden');
    this.startCycling(texts);
  }

  hide() {
    this.overlay.classList.add('hidden');
    if (this.interval) clearInterval(this.interval);
  }

  startCycling(texts) {
    let i = 0;
    this.textEl.textContent = texts[0];
    this.interval = setInterval(() => {
      i = (i + 1) % texts.length;
      this.textEl.textContent = texts[i];
    }, 1200);
  }
}

const loader = new LoadingController('loading-overlay', 'loading-text');

// --- App State ---
let currentFilter = null;
let currentLink = null;
let allLinks = [];
let usedLinkIds = new Set();

// --- Init: Site Loading → Show Card ---
window.addEventListener('load', async () => {
  loader.show(MEMES.site);
  await new Promise(r => setTimeout(r, 2800));
  loader.hide();
  document.getElementById('app').classList.remove('hidden');
});

// --- Step 1: Get My Link ---
document.getElementById('btn-get-link').addEventListener('click', async () => {
  loader.show(MEMES.linkGen);
  await new Promise(r => setTimeout(r, 1500));
  loader.hide();

  document.getElementById('step-get-link').classList.add('hidden');
  document.getElementById('step-filter').classList.remove('hidden');

  await loadFilters();
});

// --- Load Filters from Supabase ---
async function loadFilters() {
  const { data, error } = await supabase
    .from('filters')
    .select('*')
    .eq('is_enabled', true)
    .order('name');

  if (error) { console.error(error); return; }

  const grid = document.getElementById('filter-grid');
  grid.innerHTML = '';

  data.forEach(filter => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = filter.name;
    btn.addEventListener('click', () => selectFilter(filter.name));
    grid.appendChild(btn);
  });
}

// --- Step 3: Select Filter → Fetch Link ---
async function selectFilter(filterName) {
  currentFilter = filterName;
  document.getElementById('step-filter').classList.add('hidden');
  document.getElementById('step-result').classList.remove('hidden');

  await fetchAndShowLink();
}

// --- Fetch Link with In-Box Loading ---
async function fetchAndShowLink() {
  const box = document.getElementById('result-box');

  // In-box loading
  box.innerHTML = `
    <div class="inbox-loading">
      ${Array.from({ length: 30 }, () => '<div class="space-dot"></div>').join('')}
    </div>
    <p class="loading-text" id="inbox-text">connecting to link gen</p>
  `;

  // Cycle meme text
  let memeIdx = 0;
  const memeInterval = setInterval(() => {
    const el = document.getElementById('inbox-text');
    if (el) {
      memeIdx = (memeIdx + 1) % MEMES.linkGen.length;
      el.textContent = MEMES.linkGen[memeIdx];
    }
  }, 1000);

  // Randomize dot positions
  setTimeout(() => {
    document.querySelectorAll('.space-dot').forEach(dot => {
      dot.style.right = `${Math.random() * 100}%`;
      dot.style.bottom = `${Math.random() * 100}%`;
      dot.style.animationDelay = `${Math.random() * 1.4}s`;
      dot.style.animationDuration = `${1 + Math.random() * 0.8}s`;
    });
  }, 50);

  // Fetch link from Supabase
  const { data: links, error } = await supabase
    .from('links')
    .select('*')
    .eq('filter_name', currentFilter)
    .eq('is_active', true)
    .order('strength', { ascending: true });

  clearInterval(memeInterval);

  if (error || !links || links.length === 0) {
    box.innerHTML = `
      <p class="loading-text" style="color:#f87171;">
        No links available for ${currentFilter}
      </p>
    `;
    return;
  }

  // Pick first unused link
  const available = links.filter(l => !usedLinkIds.has(l.id));
  if (available.length === 0) {
    box.innerHTML = `
      <p class="loading-text" style="color:#fbbf24;">
        All links exhausted for ${currentFilter}. Try another filter.
      </p>
    `;
    return;
  }

  currentLink = available[0];
  usedLinkIds.add(currentLink.id);

  // Show link with Open + Feedback buttons
  box.innerHTML = `
    <div style="padding: 24px; text-align: center; width: 100%;">
      <p style="color: #94a3b8; margin-bottom: 8px; font-size: 0.85rem;">
        ${currentFilter} · strength ${currentLink.strength}
      </p>
      <a href="${currentLink.url}" target="_blank" rel="noopener"
         style="display:inline-block; background:var(--blue); color:#0a0a0f;
                padding:12px 32px; border-radius:999px; font-weight:600;
                text-decoration:none; margin:12px 0;">
        open arcade →
      </a>
      <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center;">
        <button id="btn-worked" class="btn-primary" style="background:#22c55e; padding:10px 24px; font-size:0.9rem;">
          it worked ✓
        </button>
        <button id="btn-failed" class="btn-primary" style="background:#ef4444; padding:10px 24px; font-size:0.9rem;">
          it didn't work ✗
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-worked').addEventListener('click', () => {
    box.innerHTML = `
      <p style="color:#22c55e; padding:40px; font-size:1.1rem;">
        Enjoy the Arcade! 🎮
      </p>
    `;
  });

  document.getElementById('btn-failed').addEventListener('click', async () => {
    // Increase strength (simulate GN Math filter detection)
    await supabase
      .from('links')
      .update({ strength: (currentLink.strength || 0) + 10 })
      .eq('id', currentLink.id);

    // Deactivate if strength > 80
    if ((currentLink.strength || 0) + 10 > 80) {
      await supabase
        .from('links')
        .update({ is_active: false })
        .eq('id', currentLink.id);
    }

    await fetchAndShowLink();
  });
}

// --- Admin Trigger: Hold 3 seconds ---
let holdTimer = null;
const adminTrigger = document.getElementById('admin-trigger');
const adminModal = document.getElementById('admin-modal');

adminTrigger.addEventListener('mousedown', startHold);
adminTrigger.addEventListener('touchstart', startHold);
adminTrigger.addEventListener('mouseup', cancelHold);
adminTrigger.addEventListener('mouseleave', cancelHold);
adminTrigger.addEventListener('touchend', cancelHold);

function startHold(e) {
  e.preventDefault();
  holdTimer = setTimeout(() => {
    showAdmin404();
  }, 3000);
}

function cancelHold() {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
}

function showAdmin404() {
  adminModal.classList.remove('hidden');
  document.getElementById('admin-404').classList.remove('hidden');
  document.getElementById('admin-login').classList.add('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('admin-code-input').value = '';
  document.getElementById('admin-code-input').focus();
}

document.getElementById('admin-code-submit').addEventListener('click', async () => {
  const code = document.getElementById('admin-code-input').value.trim();
  if (code === '404') {
    // In-box loading then show login
    const el = document.getElementById('admin-404');
    el.innerHTML = `
      <div class="inbox-loading">
        ${Array.from({ length: 20 }, () => '<div class="space-dot"></div>').join('')}
      </div>
      <p class="loading-text">authenticating</p>
    `;

    await new Promise(r => setTimeout(r, 1800));

    // Check if already signed in as admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') {
        showAdminPanel();
        return;
      }
    }

    // Show login
    document.getElementById('admin-404').classList.add('hidden');
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-login').innerHTML = `
      <h3 style="margin-bottom:16px;">Admin Login</h3>
      <input type="email" id="admin-email" placeholder="email"
             style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.15);
                    background:rgba(0,0,0,0.3);color:var(--text);margin-bottom:12px;outline:none;">
      <input type="password" id="admin-pass" placeholder="password"
             style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.15);
                    background:rgba(0,0,0,0.3);color:var(--text);margin-bottom:16px;outline:none;">
      <button id="admin-login-btn" class="btn-primary">sign in</button>
    `;

    document.getElementById('admin-login-btn').addEventListener('click', async () => {
      const email = document.getElementById('admin-email').value;
      const pass = document.getElementById('admin-pass').value;
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) { alert(error.message); return; }

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') {
        showAdminPanel();
      } else {
        alert('Not an admin account.');
        await supabase.auth.signOut();
      }
    });
  }
});

function showAdminPanel() {
  document.getElementById('admin-404').classList.add('hidden');
  document.getElementById('admin-login').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');

  document.getElementById('admin-panel').innerHTML = `
    <h3 style="margin-bottom:20px;">Admin Panel</h3>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <button id="admin-add-link" class="btn-primary" style="background:#22c55e;">Add Link</button>
      <button id="admin-manage-links" class="btn-primary">Manage Links</button>
      <button id="admin-manage-filters" class="btn-primary">Manage Filters</button>
      <button id="admin-manage-users" class="btn-primary">Manage Users</button>
      <button id="admin-toggle-gen" class="btn-primary" style="background:#ef4444;">Disable Link Generator</button>
      <button id="admin-logout" class="btn-primary" style="background:#64748b;">Logout</button>
    </div>
    <div id="admin-content" style="margin-top:20px;text-align:left;"></div>
  `;

  document.getElementById('admin-logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    adminModal.classList.add('hidden');
  });

  document.getElementById('admin-add-link').addEventListener('click', () => {
    document.getElementById('admin-content').innerHTML = `
      <h4>Add Link</h4>
      <input id="new-link-url" placeholder="https://..." style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.3);color:var(--text);margin:8px 0;outline:none;">
      <input id="new-link-filter" placeholder="Filter name (e.g. Linewize)" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.3);color:var(--text);margin:8px 0;outline:none;">
      <button id="new-link-submit" class="btn-primary" style="margin-top:8px;">Add</button>
    `;
    document.getElementById('new-link-submit').addEventListener('click', async () => {
      const url = document.getElementById('new-link-url').value;
      const filter = document.getElementById('new-link-filter').value;
      if (!url || !filter) return alert('Fill both fields');
      await supabase.from('links').insert({ url, filter_name: filter, strength: 0 });
      alert('Link added');
    });
  });

  document.getElementById('admin-manage-links').addEventListener('click', async () => {
    const { data: links } = await supabase.from('links').select('*').order('created_at', { ascending: false });
    let html = '<h4>All Links</h4><div style="max-height:300px;overflow-y:auto;">';
    links.forEach(l => {
      html += `<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.08);font-size:0.85rem;">
        <strong>${l.filter_name}</strong> — ${l.url.substring(0, 40)}...
        <span style="color:${l.is_active ? '#22c55e' : '#ef4444'};">
          [${l.is_active ? 'active' : 'disabled'}]
        </span>
        <button onclick="toggleLink('${l.id}', ${l.is_active})" style="margin-left:8px;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,0.2);color:var(--text);border-radius:6px;padding:2px 8px;font-size:0.75rem;">
          ${l.is_active ? 'Disable' : 'Enable'}
        </button>
        <button onclick="deleteLink('${l.id}')" style="margin-left:4px;cursor:pointer;background:transparent;border:1px solid #ef4444;color:#ef4444;border-radius:6px;padding:2px 8px;font-size:0.75rem;">
          Delete
        </button>
      </div>`;
    });
    html += '</div>';
    document.getElementById('admin-content').innerHTML = html;
  });

  document.getElementById('admin-manage-users').addEventListener('click', async () => {
    const { data: users } = await supabase.from('profiles').select('*');
    let html = '<h4>Users</h4><div style="max-height:300px;overflow-y:auto;">';
    users.forEach(u => {
      html += `<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.08);font-size:0.85rem;">
        <strong>${u.username || 'no username'}</strong> (${u.email || 'no email'})
        <span style="color:${u.is_suspended ? '#ef4444' : '#22c55e'};">
          [${u.is_suspended ? 'suspended' : 'active'}]
        </span>
        <button onclick="toggleSuspend('${u.id}', ${u.is_suspended})" style="margin-left:8px;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,0.2);color:var(--text);border-radius:6px;padding:2px 8px;font-size:0.75rem;">
          ${u.is_suspended ? 'Unsuspend' : 'Suspend'}
        </button>
        <button onclick="deleteUser('${u.id}')" style="margin-left:4px;cursor:pointer;background:transparent;border:1px solid #ef4444;color:#ef4444;border-radius:6px;padding:2px 8px;font-size:0.75rem;">
          Delete
        </button>
      </div>`;
    });
    html += '</div>';
    document.getElementById('admin-content').innerHTML = html;
  });

  document.getElementById('admin-toggle-gen').addEventListener('click', async () => {
    const { data } = await supabase.from('app_settings').select('*').eq('key', 'link_gen_enabled').single();
    const current = data?.value?.enabled ?? true;
    await supabase.from('app_settings').upsert({
      key: 'link_gen_enabled',
      value: { enabled: !current }
    });
    alert(`Link generator ${!current ? 'enabled' : 'disabled'}`);
  });
}

// Global helpers for admin inline buttons
window.toggleLink = async (id, isActive) => {
  await supabase.from('links').update({ is_active: !isActive }).eq('id', id);
  document.getElementById('admin-manage-links').click();
};
window.deleteLink = async (id) => {
  if (confirm('Delete this link?')) {
    await supabase.from('links').delete().eq('id', id);
    document.getElementById('admin-manage-links').click();
  }
};
window.toggleSuspend = async (id, isSuspended) => {
  await supabase.from('profiles').update({ is_suspended: !isSuspended }).eq('id', id);
  document.getElementById('admin-manage-users').click();
};
window.deleteUser = async (id) => {
  if (confirm('Delete this user profile?')) {
    await supabase.from('profiles').delete().eq('id', id);
    document.getElementById('admin-manage-users').click();
  }
};
