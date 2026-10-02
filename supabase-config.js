// Supabase configuration for Freedoms Arcade Link Gen
const SUPABASE_URL = 'https://wuyldeldvltmfqgysdoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1eWxkZWxkdmx0bWZxZ3lzZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzA1NzMsImV4cCI6MjEwNjQ0NjU3M30.08mOmItQr9YMO9AqUOjtQp37OU3PQiPKxbGgNRGyLBE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
window.faSupabase = supabase;
