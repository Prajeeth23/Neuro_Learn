import { createClient } from '@supabase/supabase-js';

// Access variables configured in Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://avkqnlkmslrwpztixscb.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_SWuVZNGB1Qvk1abAYhAcgA_5GP4EFR4';

export const supabase = createClient(supabaseUrl, supabaseKey);
