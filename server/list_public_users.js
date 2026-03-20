const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbUrl = process.env.SUPABASE_DB_URL;

const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function listPublicUsers() {
  try {
    await client.connect();
    
    // List users from public.users
    const res = await client.query(
      "SELECT * FROM public.users LIMIT 10"
    );

    console.log('Users in public.users:');
    res.rows.forEach(row => {
      console.log(`- ${row.id} | ${row.email} | ${row.name}`);
    });

  } catch (err) {
    console.error('Error executing query:', err.message);
  } finally {
    await client.end();
  }
}

listPublicUsers();
