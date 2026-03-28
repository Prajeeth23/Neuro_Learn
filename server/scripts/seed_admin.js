require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials missing in .env');
  process.exit(1);
}

// Note: This script uses the anon key. 
// For this to work, you must have an RLS policy that allows inserting into 'public.users'.
// OR you can use the SERVICE_ROLE_KEY if you have it in your .env.
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdmin() {
  console.log('🚀 Starting Admin Seeding...');

  // 1. Get the most recent user from Supabase Auth (if possible via service role)
  // Since we only have the anon key, we'll ask the user to provide their ID 
  // OR we can try to guess it if we find it in any other table.
  
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Error: Please provide your Supabase User ID as an argument.');
    console.log('Usage: node server/scripts/seed_admin.js YOUR_USER_ID');
    process.exit(1);
  }

  console.log(`👤 Targeting User ID: ${userId}`);

  const { data, error } = await supabase
    .from('users')
    .upsert({ 
      id: userId, 
      role: 'admin',
      name: 'Admin User',
      email: 'admin@neurolearn.com' // You can change this
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error seeding admin:', error.message);
    if (error.message.includes('new row violates row-level security policy')) {
      console.log('\n💡 TIP: You might need to temporarily disable RLS on the "users" table in Supabase Dashboard or use your SERVICE_ROLE_KEY.');
    }
  } else {
    console.log('✅ Success! User is now an admin.');
    console.log(data);
  }
}

seedAdmin();
