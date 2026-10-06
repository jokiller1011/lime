// =============================================
// Freedom's Arcade v4 — Link Generator App
// =============================================

import { showLoading, hideLoading, showInBoxLoading } from './loading.js';
import {
  supabase, getFilters, getLinkForFilter,
  reportLinkAttempt, getUser
} from './supabase-config.js';

let selectedFilter = null;
let currentLink = null;
let filtersData = [];

// ---- Init ----
async function init() {
  // Show site loading on first load
  showLoading('site');

  try {
    filtersData = await getFilters();
    renderFilters();
  } catch (err) {
    console.error('Failed to load filters:', err);
  } finally {
    setTimeout(() => hideLoading(), 1500);
  }
}

// ---- Render Filters ----
function renderFilters() {
  const grid = document.getElementById('filter-grid');
  grid.innerHTML = '';

  filtersData.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = f.name;
    btn.dataset.id = f.id;
    btn.addEventListener('click', () => selectFilter(f, btn));
    grid.appendChild(btn);
  });
}

function selectFilter(filter, btnEl) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  selectedFilter = filter;
}

// ---- Get Link Flow ----
async function handleGetLink() {
  if (!selectedFilter) {
    alert('Please select a filter first.');
    return;
  }

  const frame = document.getElementById('link-result-frame');
  frame.classList.remove('hidden');
  document.getElementById('no-links-msg').classList.add('hidden');

  // In-box loading
  const inbox = showInBoxLoading('link-result-frame', 'linkgen');

  // Show filter section
  document.getElementById('filter-section').classList.remove('hidden');

  try {
    // Attempt to get a working link
    let attempts = 0;
    const maxAttempts = 5;
    let workingLink = null;

    while (attempts < maxAttempts && !workingLink) {
      const link = await getLinkForFilter(selectedFilter.id);
      if (!link) break;

      // Simulate "checking filter" delay
      await new Promise(r => setTimeout(r, 1200));

      // In production, you'd verify the link works via your worker
      // For now, we assume it works if it exists
      workingLink = link;
      attempts++;
    }

    if (inbox && inbox.clear) inbox.clear();

    if (workingLink) {
      currentLink = workingLink;
      renderLinkResult(workingLink);
    } else {
      document.getElementById('no-links-msg').classList.remove('hidden');
      frame.classList.add('hidden');
    }
  } catch (err) {
    console.error('Link gen error:', err);
    if (inbox && inbox.clear) inbox.clear();
    frame.classList.add('hidden');
    document.getElementById('no-links-msg').classList.remove('hidden');
  }
}

function renderLinkResult(link) {
  const frame = document.getElementById('link-result-frame');
  frame.innerHTML = `
    <div class="link-actions">
      <p class="section-label">Your link is ready:</p>
      <div class="link-url">${link.url}</div>
      <div class="link-btn-row">
        <button class="btn-works" id="link-works">✅ It Works</button>
        <button class="btn-fail" id="link-fail">❌ Doesn't Work</button>
      </div>
    </div>
  `;

  document.getElementById('link-works').addEventListener('click', async () => {
    await reportLinkAttempt(link.id, selectedFilter.id, true);
    window.open(link.url, '_blank');
  });

  document.getElementById('link-fail').addEventListener('click', async () => {
    await reportLinkAttempt(link.id, selectedFilter.id, false);
    // Try another link
    await handleGetLink();
  });
}

// ---- Admin Gate (3-second hold bottom-right) ----
function setupAdminGate() {
  const corner = document.getElementById('admin-corner');
  const gate = document.getElementById('admin-gate');
  let holdTimer = null;

  corner.addEventListener('mousedown', () => {
    holdTimer = setTimeout(() => {
      gate.classList.remove('hidden');
    }, 3000);
  });

  corner.addEventListener('mouseup', () => clearTimeout(holdTimer));
  corner.addEventListener('mouseleave', () => clearTimeout(holdTimer));

  // Touch support
  corner.addEventListener('touchstart', (e) => {
    e.preventDefault();
    holdTimer = setTimeout(() => gate.classList.remove('hidden'), 3000);
  });
  corner.addEventListener('touchend', () => clearTimeout(holdTimer));

  // 404 code verification
  const codeInput = document.getElementById('admin-code-input');
  const submitBtn = document.getElementById('admin-code-submit');

  const verify = async () => {
    if (codeInput.value.trim() === '404') {
      // In-box site loading
      const inbox = showInBoxLoading('admin-gate', 'site');
      setTimeout(() => {
        if (inbox && inbox.clear) inbox.clear();
        window.location.href = 'admin.html';
      }, 1800);
    } else {
      codeInput.value = '';
      codeInput.placeholder = 'Wrong code.';
    }
  };

  submitBtn.addEventListener('click', verify);
  codeInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') verify();
  });
}

// ---- Wire Up ----
document.getElementById('get-link-btn').addEventListener('click', () => {
  document.getElementById('filter-section').classList.remove('hidden');
  handleGetLink();
});

// Start
init();
setupAdminGate();
