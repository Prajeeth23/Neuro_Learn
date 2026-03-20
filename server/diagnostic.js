const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- Deleting DSA Course ---');
  const { data: dsa, error: err1 } = await supabase.from('courses').select('id, title').ilike('title', '%Data Structures and Algorithms%');
  if (err1) console.error(err1);
  else {
    for (const c of dsa) {
      await supabase.from('courses').delete().eq('id', c.id);
      console.log('Deleted course:', c.title);
    }
  }

  console.log('\n--- Checking User Progress Table ---');
  const { data: prog, error: err2 } = await supabase.from('user_progress').select('*').limit(1);
  if (err2) console.error(err2);
  else console.log('Sample progress row:', prog);
}

run();
