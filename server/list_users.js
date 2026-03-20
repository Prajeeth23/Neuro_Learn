const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbUrl = process.env.SUPABASE_DB_URL;

const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function listUsers() {
  try {
    await client.connect();
    
    // List some users from auth.users (sensitive columns excluded)
    const res = await client.query(
      "SELECT id, email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10"
    );

    console.log('Recent Users in auth.users:');
    res.rows.forEach(row => {
      console.log(`- ${row.email} | Confirmed: ${row.email_confirmed_at ? 'YES' : 'NO'} | Created: ${row.created_at}`);
    });

  } catch (err) {
    console.error('Error executing query:', err.message);
  } finally {
    await client.end();
  }
}

listUsers();
