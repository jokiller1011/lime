// =============================================
// Freedom's Arcade v4 — Admin Suite Logic
// =============================================

import { supabase, getUser, isAdmin } from './supabase-config.js';
import { showLoading, hideLoading, showInBoxLoading } from './loading.js';

let currentUser = null;

async function init() {
  showLoading('site');

  currentUser = await getUser();

  if (!currentUser) {
    // Not logged in — show login
    renderLogin();
    return;
  }

  const admin = await isAdmin(currentUser.id);
  if (!admin) {
    document.body.innerHTML = '<div style="padding:40px;text-align:center;color:#ef4444"><h1>403 — Access Denied</h1></div>';
    return;
  }

  setTimeout(() => hideLoading(), 1000);
  setupTabs();
  loadLinks();
  loadFilters();
  loadUsers();
}

// ---- Login Screen ----
function renderLogin() {
  hideLoading();
  document.querySelector('.admin-dashboard').innerHTML = `
    <div style="max-width:400px;margin:80px auto;text-align:center">
      <h1 style="margin-bottom:24px">Admin Login</h1>
      <button class="portal-btn" id="admin-gh-login" style="margin-bottom:12px;width:100%">
        Sign in with GitHub
      </button>
      <input type="email" class="admin-input" id="admin-email" placeholder="Email">
      <input type="password" class="admin-input" id="admin-password" placeholder="Password">
      <button class="portal-btn" id="admin-email-login" style="width:100%">
        Sign in with Email
      </button>
    </div>
  `;

  document.getElementById('admin-gh-login').addEventListener('click', async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.href } });
  });

  document.getElementById('admin-email-login').addEventListener('click', async () => {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); return; }
    location.reload();
  });
}

// ---- Tabs ----
function setupTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('hidden'));
      document.getElementById(`panel-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });

  document.getElementById('admin-logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.reload();
  });
}

// ---- Load Links ----
async function loadLinks() {
  const { data: links } = await supabase
    .from('unblocker_links')
    .select('*, filters(name)')
    .order('created_at', { ascending: false });

  const container = document.getElementById('links-list');
  const filterSelect = document.getElementById('link-filter');

  // Populate filter dropdown
  const { data: filters } = await supabase.from('filters').select('*').order('name');
  filterSelect.innerHTML = '<option value="">-- Select Filter --</option>';
  filters?.forEach(f => {
    filterSelect.innerHTML += `<option value="${f.id}">${f.name}</option>`;
  });

  if (!links || links.length === 0) {
    container.innerHTML = '<p style="color:#6b7280">No links yet.</p>';
    return;
  }

  container.innerHTML = links.map(l => `
    <div class="admin-list-item">
      <div style="flex:1;min-width:0">
        <div style="font-size:0.8rem;color:#60a5fa;word-break:break-all">${l.url}</div>
        <div style="font-size:0.7rem;color:#6b7280;margin-top:4px">
          ${l.filters?.name || 'No filter'} · Used ${l.times_used}x · Success: ${l.success_rate}%
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="admin-badge ${l.is_active ? 'badge-active' : 'badge-inactive'}">
          ${l.is_active ? 'Active' : 'Disabled'}
        </span>
        <button class="portal-btn small" data-toggle="${l.id}" data-active="${l.is_active}">
          ${l.is_active ? 'Disable' : 'Enable'}
        </button>
        <button class="portal-btn small" style="background:#ef4444" data-delete="${l.id}">Delete</button>
      </div>
    </div>
  `).join('');

  // Toggle handlers
  container.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.toggle;
      const active = btn.dataset.active === 'true';
      await supabase.from('unblocker_links').update({ is_active: !active }).eq('id', id);
      loadLinks();
    });
  });

  // Delete handlers
  container.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this link?')) return;
      await supabase.from('unblocker_links').delete().eq('id', btn.dataset.delete);
      loadLinks();
    });
  });

  // Add link
  document.getElementById('add-link-btn').onclick = async () => {
    const url = document.getElementById('link-url').value.trim();
    const filterId = document.getElementById('link-filter').value;
    if (!url || !filterId) { alert('Fill in both fields.'); return; }

    await supabase.from('unblocker_links').insert({
      url, filter_id: filterId, created_by: currentUser.id
    });
    document.getElementById('link-url').value = '';
    loadLinks();
  };
}

async function loadFilters() {
  const { data } = await supabase.from('filters').select('*').order('name');
  const container = document.getElementById('filters-admin-list');
  if (!data) return;
  container.innerHTML = data.map(f => `
    <div class="admin-list-item">
      <span>${f.name}</span>
      <span style="color:#6b7280;font-size:0.8rem">Strength: ${f.strength}/5</span>
    </div>
  `).join('');
}

async function loadUsers() {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
  const container = document.getElementById('users-list');
  if (!data) return;
  container.innerHTML = data.map(u => `
    <div class="admin-list-item">
      <div>
        <div style="font-weight:600">${u.username || 'Unknown'}</div>
        <div style="font-size:0.75rem;color:#6b7280">${u.id.slice(0, 8)}...</div>
      </div>
      <button class="portal-btn small" style="background:#ef4444" data-suspend="${u.id}">Suspend</button>
    </div>
  `).join('');

  container.querySelectorAll('[data-suspend]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const reason = prompt('Reason for suspension:');
      if (!reason) return;
      await supabase.from('suspensions').insert({
        user_id: btn.dataset.suspend,
        reason,
        suspended_by: currentUser.id
      });
      alert('User suspended.');
    });
  });
}

init();
