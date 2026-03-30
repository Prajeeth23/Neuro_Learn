const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Prioritize Service Role Key for backend operations
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase;

try {
  if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ Supabase credentials missing during startup!');
  }
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Client initialized');
} catch (err) {
  console.error('🔥 Supabase Client Crash on Startup:', err.message);
  // Create a dummy client that throws on query but doesn't crash the server
  supabase = {
    from: () => ({ select: () => ({ limit: () => Promise.resolve({ error: { message: 'Supabase not initialized: ' + err.message } }) }) })
  };
}

// Diagnostic: non-blocking check
if (supabaseUrl && supabaseKey) {
  supabase.from('courses').select('id').limit(1).then(({ error }) => {
    if (error) {
      console.error('❌ Supabase DB Diagnostic Error:', error.message);
      if (error.message.includes('relation "courses" does not exist')) {
        console.error('CRITICAL: The "courses" table is missing. Please run database migrations.');
      }
    } else {
      console.log('✅ Supabase DB Diagnostic: Connection Successful');
    }
  }).catch(err => {
    console.error('❌ Supabase DB Diagnostic Crash:', err.message);
  });
}

module.exports = supabase;
