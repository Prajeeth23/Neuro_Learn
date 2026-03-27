const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key must be provided in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdmin(email) {
  console.log(`--- Giving admin access to ${email} ---`);
  
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error updating role:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`Successfully updated ${email} to admin role.`);
    console.log('User data:', data[0]);
  }
  process.exit(0);
}

setAdmin('kit28.24bad115@gmail.com');
