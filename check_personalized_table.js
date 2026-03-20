const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  const { data, error } = await supabase
    .from('personalized_materials')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching personalized_materials:', error);
  } else {
    console.log('Successfully fetched from personalized_materials:', data);
  }
}

checkTable();
