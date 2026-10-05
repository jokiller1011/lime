// config.js
const SUPABASE_URL = 'https://wuyldeldvltmfqgysdoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1eWxkZWxkdmx0bWZxZ3lzZG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzA1NzMsImV4cCI6MjEwNjQ0NjU3M30.08mOmItQr9YMO9AqUOjtQp37OU3PQiPKxbGgNRGyLBE';

// Initialize Supabase Client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Proxy Engine Configurations
const PROXY_ENGINES = {
  'scramjet-2.0.67': {
    name: 'Scramjet 2.0.67-alpha.2',
    path: '/scramjet/2.0.67/',
    type: 'scramjet'
  },
  'scramjet-2x': {
    name: 'Scramjet 2x Stable',
    path: '/scramjet/2x/',
    type: 'scramjet'
  },
  'scramjet-1x': {
    name: 'Scramjet 1x Stable',
    path: '/scramjet/1x/',
    type: 'scramjet'
  },
  'ultraviolet-3x': {
    name: 'Ultraviolet 3x Legacy Support',
    path: '/uv/3x/',
    type: 'ultraviolet'
  }
};

// Standard Loading Memes
const STANDARD_MEMES = [
  'light speed',
  '“huh”-peetzah',
  'filters cant stop me, can they?',
  'improving vital testing equipment',
  'this is for your own safety',
  'you probably shouldn\'t do that',
  'high score, low GPA',
  'you know what else is massive?',
  'initializing',
  'authenticating teacher portal',
  'time to fly',
  'did you hear that too?'
];

// Site Loading Messages
const SITE_LOADING_MESSAGES = [
  'deploying proxy (this might take a sec)',
  'stripping headers',
  'blocking ads and cookies',
  'revving the engine'
];

// Link Generating Loading Messages
const LINK_GEN_MESSAGES = [
  'connecting to link gen',
  'generating link',
  'checking your filter'
];

// Export for use in other modules (if using ES modules)
// export { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseClient, PROXY_ENGINES, STANDARD_MEMES, SITE_LOADING_MESSAGES, LINK_GEN_MESSAGES };
