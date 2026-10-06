// ============================================
// SUPABASE CLIENT
// ============================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Auth helpers ---

export async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// --- Data helpers ---

export async function getFilters() {
  const { data, error } = await supabase
    .from('filters')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data;
}

export async function getProxyLinksForFilter(filterName) {
  const { data, error } = await supabase
    .from('proxy_links')
    .select('*')
    .eq('filter_name', filterName)
    .eq('is_active', true)
    .order('success_count', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllProxyLinks() {
  const { data, error } = await supabase
    .from('proxy_links')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addProxyLink(url, filterName, strength) {
  const { data, error } = await supabase
    .from('proxy_links')
    .insert([{ url, filter_name: filterName, filter_strength: strength }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProxyLink(id, updates) {
  const { data, error } = await supabase
    .from('proxy_links')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProxyLink(id) {
  const { error } = await supabase
    .from('proxy_links')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function recordLinkAttempt(userId, filterId, linkId, status) {
  const { error } = await supabase
    .from('link_history')
    .insert([{ user_id: userId, filter_id: filterId, link_id: linkId, status }]);
  if (error) throw error;
}

export async function getSystemSetting(key) {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single();
  if (error) throw error;
  return data?.value;
}

export async function updateSystemSetting(key, value) {
  const { error } = await supabase
    .from('system_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateUserRole(userId, role) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw error;
}
