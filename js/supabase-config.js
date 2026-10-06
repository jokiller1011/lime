// =============================================
// Freedom's Arcade v4 — Supabase Client Config
// =============================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://wuyldeldvltmfqgysdoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1eWxkZWxkdmx0bWZxZ3lzZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzA1NzMsImV4cCI6MjEwNjQ0NjU3M30.08mOmItQr9YMO9AqUOjtQp37OU3PQiPKxbGgNRGyLBE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// ---- Auth Helpers ----
export async function signInWithGitHub() {
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
    options: { data: { user_name: username } }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ---- Profile Helpers ----
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- Filter Helpers ----
export async function getFilters() {
  const { data, error } = await supabase
    .from('filters')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

// ---- Link Helpers ----
export async function getLinkForFilter(filterId) {
  const { data, error } = await supabase
    .from('unblocker_links')
    .select('*')
    .eq('filter_id', filterId)
    .eq('is_active', true)
    .order('success_rate', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

export async function reportLinkAttempt(linkId, filterId, success) {
  const { error } = await supabase
    .from('link_attempts')
    .insert({ link_id: linkId, filter_id: filterId, success });
  if (error) console.error('Failed to report attempt:', error);
}

// ---- Admin Helpers ----
export async function isAdmin(userId) {
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userId)
    .single();
  if (error) return false;
  return !!data;
}
