import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env
  ? import.meta.env.VITE_SUPABASE_URL
  : process.env.REACT_APP_SUPABASE_URL;

const supabaseKey = import.meta.env
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : process.env.REACT_APP_SUPABASE_ANON_KEY;

export const QuerySupabase = createClient(supabaseUrl, supabaseKey);