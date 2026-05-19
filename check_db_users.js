const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error('❌ Error: SUPABASE_DB_URL is missing in .env');
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL database.');

    console.log('\n--- FETCHING USERS FROM auth.users ---');
    const authRes = await client.query(
      `SELECT id, email, created_at, email_confirmed_at, last_sign_in_at, confirmed_at 
       FROM auth.users 
       ORDER BY created_at DESC LIMIT 10;`
    );
    console.table(authRes.rows);

    console.log('\n--- FETCHING USERS FROM public.users ---');
    const publicRes = await client.query(
      `SELECT id, email, name, role, created_at 
       FROM public.users 
       ORDER BY created_at DESC LIMIT 10;`
    );
    console.table(publicRes.rows);

  } catch (err) {
    console.error('❌ Database error:', err.message);
  } finally {
    await client.end();
  }
}

run();
