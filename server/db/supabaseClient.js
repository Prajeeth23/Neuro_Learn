const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing (URL or Key)');
  // Don't throw in production to prevent crashes, but log clearly
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Supabase URL and Key must be provided in environment variables');
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
