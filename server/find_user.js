const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbUrl = process.env.SUPABASE_DB_URL;

const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function findUser() {
  const email = 'prajeethraj81@gmail.com';
  try {
    await client.connect();
    const res = await client.query("SELECT id, email, email_confirmed_at FROM auth.users WHERE email = $1", [email]);
    if (res.rowCount > 0) {
      console.log(`FOUND: ${res.rows[0].email} | Confirmed: ${res.rows[0].email_confirmed_at}`);
    } else {
      console.log(`NOT FOUND: ${email}`);
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

findUser();
