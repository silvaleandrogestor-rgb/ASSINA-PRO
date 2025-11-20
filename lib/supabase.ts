

import { createClient } from '@supabase/supabase-js';

// User-provided Supabase credentials
const supabaseUrl = 'https://njxcddubrgybmkzueavr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeGNkZHVicmd5Ym1renVlYXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjUzMjgsImV4cCI6MjA3OTEwMTMyOH0.d4nIfqjQCRzAWXGBWYHtvkG4NWXSb6AZzmuQNShPL40';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);