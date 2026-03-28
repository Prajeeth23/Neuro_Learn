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

// Diagnostic Check (Non-blocking)
if (supabaseUrl && supabaseKey) {
  supabase.from('courses').select('id', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) {
        console.error('Supabase DB Diagnostic Error:', error.message);
        if (error.message.includes('relation "courses" does not exist')) {
          console.error('CRITICAL: The "courses" table is missing. Please run database migrations.');
        }
      } else {
        console.log('Supabase DB connection successful.');
      }
    })
    .catch(err => console.error('Supabase DB connection failed:', err.message));
}

module.exports = supabase;
