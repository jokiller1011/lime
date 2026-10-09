import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://szxtsmgiorxenheakwoz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eHRzbWdpb3J4ZW5oZWFrd296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MTc0MzYsImV4cCI6MjEwNzA5MzQzNn0.nSOmXsSzfLMfhMnq1jvhr5OccKC5tcSGwa6rFwj9kkk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
