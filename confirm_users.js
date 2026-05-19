const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env');
  process.exit(1);
}

// Create a Supabase client with the service role key to bypass RLS and access admin APIs
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log('🔍 Connecting to Supabase Auth to fetch users...');
  
  // Fetch users using the Auth Admin API
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Error listing users:', error.message);
    process.exit(1);
  }

  if (users.length === 0) {
    console.log('ℹ️ No users found in Supabase Auth.');
    process.exit(0);
  }

  console.log(`\n📋 Found ${users.length} total users in Supabase Auth:`);
  
  for (const user of users) {
    const isConfirmed = !!user.email_confirmed_at;
    console.log(`- Email: ${user.email} | Confirmed: ${isConfirmed ? '✅ Yes' : '❌ No'} | ID: ${user.id}`);
    
    if (!isConfirmed) {
      console.log(`   ⚡ Confirming email for ${user.email}...`);
      
      // Update email_confirm state to true using Admin API
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        console.error(`   ❌ Failed to confirm ${user.email}:`, updateError.message);
      } else {
        console.log(`   ✅ Successfully confirmed ${user.email}!`);
        
        // Also check if they are in the public.users table. If not, insert them or ensure they are present.
        console.log(`   📝 Checking if public.users table has profile for ${user.email}...`);
        const { data: publicUser, error: checkError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (checkError || !publicUser) {
          console.log(`   ➕ Creating profile in public.users table...`);
          const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              name: fullName,
              role: 'user'
            });
            
          if (insertError) {
            console.error(`   ❌ Failed to insert profile:`, insertError.message);
          } else {
            console.log(`   ✅ Profile created/updated in public.users.`);
          }
        }
      }
    }
  }
  
  console.log('\n✨ All unverified users have been confirmed successfully!');
  process.exit(0);
}

run();
