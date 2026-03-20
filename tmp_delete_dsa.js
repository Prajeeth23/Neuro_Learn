const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteCourse() {
  const { data, error } = await supabase.from('courses').select('id, title').ilike('title', '%Data Structures and Algorithms%');
  if (error) {
    console.error('Error fetching courses:', error);
    return;
  }
  
  console.log('Found courses:', data);
  for (const course of data) {
    const { error: delError } = await supabase.from('courses').delete().eq('id', course.id);
    if (delError) {
      console.error('Error deleting course', course.id, delError);
    } else {
      console.log('Successfully deleted course:', course.id);
    }
  }
}

deleteCourse();
