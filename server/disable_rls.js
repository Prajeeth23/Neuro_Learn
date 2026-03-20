const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
});

async function disableRLS() {
  const client = await pool.connect();
  try {
    console.log('Disabling RLS on courses and modules tables...');
    
    // Disable RLS on courses table
    await client.query('ALTER TABLE courses DISABLE ROW LEVEL SECURITY;');
    console.log('Disabled RLS on courses table.');

    // Disable RLS on modules table
    await client.query('ALTER TABLE modules DISABLE ROW LEVEL SECURITY;');
    console.log('Disabled RLS on modules table.');

  } catch (error) {
    console.error('Error disabling RLS:', error);
  } finally {
    client.release();
    pool.end();
  }
}

disableRLS();
