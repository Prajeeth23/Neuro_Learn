const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error('Error: SUPABASE_DB_URL not found in .env');
  process.exit(1);
}

const emailToConfirm = process.argv[2];

if (!emailToConfirm) {
  console.error('Usage: node confirm_user.js <email>');
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function confirmUser() {
  try {
    await client.connect();
    
    // Update auth.users to confirm email
    const res = await client.query(
      "UPDATE auth.users SET email_confirmed_at = now() WHERE email = $1 returning id",
      [emailToConfirm]
    );

    if (res.rowCount === 0) {
      console.log(`User with email ${emailToConfirm} not found in auth.users.`);
    } else {
      console.log(`Successfully confirmed user ${emailToConfirm} (ID: ${res.rows[0].id})`);
    }

  } catch (err) {
    console.error('Error executing query:', err.message);
  } finally {
    await client.end();
  }
}

confirmUser();
