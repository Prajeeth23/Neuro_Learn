const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- Deleting DSA Course ---');
  const { data: dsa, error: err1 } = await supabase.from('courses').select('id, title').ilike('title', '%Data Structures and Algorithms%');
  if (err1) { console.error('Error fetching:', err1); return; }
  
  if (!dsa || dsa.length === 0) {
    console.log('No such course found.');
  } else {
    for (const c of dsa) {
      const { error } = await supabase.from('courses').delete().eq('id', c.id);
      if (error) console.error('Error deleting:', error);
      else console.log('Successfully deleted course:', c.title);
    }
  }
}

run();
