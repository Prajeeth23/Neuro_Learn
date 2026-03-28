require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const requiredTables = [
  'users',
  'courses',
  'modules',
  'user_progress',
  'user_activity',
  'personalized_materials',
  'screen_time',
  'quiz_results',
  'roadmaps'
];

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database Schema...');
  console.log(`URL: ${supabaseUrl}`);
  
  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error(`❌ Table "${table}": MISSING`);
      } else {
        console.error(`⚠️ Table "${table}": Error [${error.code}] ${error.message}`);
      }
    } else {
      console.log(`✅ Table "${table}": FOUND`);
    }
  }
  
  console.log('\nFinal Verdict:');
  console.log('If tables are missing, please run the SQL migrations from your Supabase SQL Editor.');
}

checkDatabase();
