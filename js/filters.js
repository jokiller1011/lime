// ============================================
// FILTER MANAGEMENT
// ============================================

import { supabase } from './supabase-client.js';

export async function loadFilters() {
  const { data, error } = await supabase
    .from('filters')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Failed to load filters:', error);
    return [];
  }
  return data || [];
}

export function renderFilterList(filters, containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  filters.forEach(filter => {
    const el = document.createElement('div');
    el.className = 'filter-option';
    el.innerHTML = `
      <div>
        <div class="filter-name">${filter.name}</div>
        <div class="filter-desc">${filter.description || ''}</div>
      </div>
      <span class="filter-strength-badge">Lv.${filter.strength}</span>
    `;
    el.addEventListener('click', () => {
      container.querySelectorAll('.filter-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      if (onSelect) onSelect(filter);
    });
    container.appendChild(el);
  });
}
