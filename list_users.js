const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  console.log('--- Listing Users ---');
  const { data, error } = await supabase.from('users').select('email, role');
  if (error) { console.error(error); return; }
  console.log(data);
  process.exit(0);
}

listUsers();
