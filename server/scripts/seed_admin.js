require('dotenv').config();
const { Client } = require('pg');

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error('❌ Error: SUPABASE_DB_URL missing in .env');
  process.exit(1);
}

async function seedAdmin() {
  console.log('🚀 Starting Admin Seeding via Direct DB Connection...');

  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Error: Please provide your Supabase User ID as an argument.');
    console.log('Usage: node server/scripts/seed_admin.js YOUR_USER_ID');
    process.exit(1);
  }

  console.log(`👤 Targeting User ID: ${userId}`);

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const query = `
      INSERT INTO public.users (id, email, role, name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET role = 'admin';
    `;
    
    const values = [userId, 'admin@neurolearn.com', 'admin', 'Admin User'];
    
    await client.query(query, values);
    
    console.log('✅ Success! User is now an admin.');
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
  } finally {
    await client.end();
  }
}

seedAdmin();

seedAdmin();
