const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

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

    console.log('\n--- FETCHING RECENT AUTH AUDIT LOGS ---');
    const logsRes = await client.query(
      `SELECT id, payload, created_at 
       FROM auth.audit_log_entries 
       ORDER BY created_at DESC LIMIT 15;`
    );
    
    for (const row of logsRes.rows) {
      console.log(`\nTime: ${row.created_at}`);
      console.log(`Event: ${row.payload?.action} | Actor: ${row.payload?.actor_username}`);
      console.log(`Payload:`, JSON.stringify(row.payload, null, 2));
    }

  } catch (err) {
    console.error('❌ Database error:', err.message);
  } finally {
    await client.end();
  }
}

run();
