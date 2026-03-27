import { createClient } from '@supabase/supabase-js';

// Access variables configured in Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dqskjdyptxulkdxvdjnj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fCiBoQ6JF8zFTi7kpnl5kQ_ohBsUIJi';

export const supabase = createClient(supabaseUrl, supabaseKey);
