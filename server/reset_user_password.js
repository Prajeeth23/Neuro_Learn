const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword(email, newPassword) {
  console.log(`🔍 Finding user ${email}...`);
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    return;
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`❌ User ${email} not found.`);
    return;
  }
  
  console.log(`⚡ Updating password for ${email} to "${newPassword}"...`);
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );
  
  if (error) {
    console.error(`❌ Failed to update password for ${email}:`, error.message);
  } else {
    console.log(`✅ Successfully reset password for ${email}!`);
  }
}

async function run() {
  await resetPassword('kit28.24bad114@gmail.com', 'Password123!');
  await resetPassword('testuser123@gmail.com', 'Password123!');
  process.exit(0);
}

run();
