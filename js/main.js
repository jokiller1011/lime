// main.js - Link Generator Logic

let currentFilter = null;
let currentLink = null;

// --- Loading Utilities ---
function showLoading(type = 'site') {
  const overlay = document.getElementById('loadingOverlay');
  const textEl = document.getElementById('loadingText');
  overlay.classList.remove('hidden');

  let messages;
  if (type === 'site') messages = SITE_LOADING_MESSAGES;
  else if (type === 'linkgen') messages = LINK_GEN_MESSAGES;
  else messages = STANDARD_MEMES;

  let index = 0;
  textEl.textContent = messages[index];
  textEl.style.animation = 'none';
  textEl.offsetHeight; // Trigger reflow
  textEl.style.animation = 'fadeText 0.5s ease';

  const interval = setInterval(() => {
    index = (index + 1) % messages.length;
    textEl.textContent = messages[index];
    textEl.style.animation = 'none';
    textEl.offsetHeight;
    textEl.style.animation = 'fadeText 0.5s ease';
  }, 2500);

  // Store interval to clear later
  overlay.dataset.intervalId = interval;
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  const intervalId = overlay.dataset.intervalId;
  if (intervalId) clearInterval(intervalId);
  overlay.classList.add('hidden');
}

function showInboxLoading() {
  const container = document.getElementById('inboxLoading');
  container.style.display = 'block';
  container.innerHTML = '';

  // Create dots
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.animationDelay = `${i * 0.15}s`;
    // Randomize starting position slightly
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    container.appendChild(dot);
  }
}

function hideInboxLoading() {
  document.getElementById('inboxLoading').style.display = 'none';
}

// --- Initialization ---
async function init() {
  // Show site loading briefly
  showLoading('site');
  await new Promise(resolve => setTimeout(resolve, 2000));
  hideLoading();

  // Load filters
  await loadFilters();
}

async function loadFilters() {
  const select = document.getElementById('filterSelect');
  try {
    const { data, error } = await supabaseClient
      .from('filters')
      .select('*')
      .order('name');

    if (error) throw error;

    data.forEach(filter => {
      const option = document.createElement('option');
      option.value = filter.name;
      option.textContent = filter.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load filters:', err);
    // Fallback filters
    const fallback = ['Linewize', 'Lightspeed', 'Dyknow Cloud', 'Senso Cloud', 'Go Guardian', 'Securly', 'ContentKeeper', 'iboss'];
    fallback.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }
}

// --- Link Generation ---
async function generateLink(filterName) {
  try {
    // Fetch active links for this filter
    const { data: filterData, error: filterError } = await supabaseClient
      .from('filters')
      .select('id')
      .eq('name', filterName)
      .single();

    if (filterError) throw filterError;

    const { data: links, error: linkError } = await supabaseClient
      .from('links')
      .select('*')
      .eq('filter_id', filterData.id)
      .eq('is_active', true)
      .order('success_rate', { ascending: false });

    if (linkError) throw linkError;

    if (!links || links.length === 0) {
      return { error: 'No links available for this filter.' };
    }

    // Pick the best link (highest success rate)
    const link = links[0];

    // Simulate GN-Math check
    const isWorking = await simulateGNMathCheck(link.url, filterName);

    if (!isWorking) {
      // Mark as failed, try next
      await supabaseClient
        .from('links')
        .update({ success_rate: Math.max(0, link.success_rate - 0.1) })
        .eq('id', link.id);

      // Recursively try next link (simplified)
      const nextLinks = links.slice(1);
      if (nextLinks.length > 0) {
        const nextLink = nextLinks[0];
        return { link: nextLink.url, id: nextLink.id };
      }
      return { error: 'All links exhausted for this filter.' };
    }

    // Update success rate
    await supabaseClient
      .from('links')
      .update({ success_rate: Math.min(1, link.success_rate + 0.05) })
      .eq('id', link.id);

    return { link: link.url, id: link.id };
  } catch (err) {
    console.error('Link generation error:', err);
    return { error: 'Failed to generate link. Please try again.' };
  }
}

// Simulate a GN-Math style check (this would be a real API call in production)
async function simulateGNMathCheck(url, filterName) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  // For demo: 70% success rate
  return Math.random() > 0.3;
}

// --- Event Handlers ---
document.getElementById('getLinkBtn').addEventListener('click', async () => {
  const filterName = document.getElementById('filterSelect').value;
  if (!filterName) {
    alert('Please select a filter first.');
    return;
  }

  currentFilter = filterName;

  // Show in-box link generation loading
  showInboxLoading();

  const result = await generateLink(filterName);

  hideInboxLoading();

  const resultDiv = document.getElementById('linkResult');
  const urlEl = document.getElementById('linkUrl');

  if (result.error) {
    alert(result.error);
    resultDiv.classList.remove('visible');
    return;
  }

  currentLink = result;
  urlEl.textContent = result.link;
  resultDiv.classList.add('visible');
});

document.getElementById('linkWorksBtn').addEventListener('click', async () => {
  if (!currentLink || !currentFilter) return;

  // Record success
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (user) {
    await supabaseClient.from('user_link_history').insert({
      user_id: user.id,
      link_id: currentLink.id,
      filter_id: null, // We'd need to look this up
      status: 'success'
    });
  }

  // Open the link
  window.open(currentLink.link, '_blank');
});

document.getElementById('linkFailsBtn').addEventListener('click', async () => {
  if (!currentFilter) return;

  // Show loading again
  showInboxLoading();

  const result = await generateLink(currentFilter);

  hideInboxLoading();

  if (result.error) {
    alert(result.error);
    return;
  }

  currentLink = result;
  document.getElementById('linkUrl').textContent = result.link;
});

// --- Admin Portal ---
const adminTrigger = document.getElementById('adminTrigger');
let holdTimer = null;

adminTrigger.addEventListener('mousedown', () => {
  holdTimer = setTimeout(() => {
    document.getElementById('adminModal').classList.add('visible');
  }, 3000);
});

adminTrigger.addEventListener('mouseup', () => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
});

adminTrigger.addEventListener('mouseleave', () => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
});

// Touch support
adminTrigger.addEventListener('touchstart', (e) => {
  e.preventDefault();
  holdTimer = setTimeout(() => {
    document.getElementById('adminModal').classList.add('visible');
  }, 3000);
});

adminTrigger.addEventListener('touchend', () => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
});

document.getElementById('adminSubmitBtn').addEventListener('click', () => {
  const code = document.getElementById('adminCodeInput').value;
  if (code === '404') {
    // Redirect to admin login
    window.location.href = 'admin.html';
  } else {
    document.getElementById('adminCodeInput').style.borderColor = '#ef4444';
    setTimeout(() => {
      document.getElementById('adminCodeInput').style.borderColor = '';
    }, 1000);
  }
});

// Allow Enter key in admin input
document.getElementById('adminCodeInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('adminSubmitBtn').click();
  }
});

// --- Start ---
init();
