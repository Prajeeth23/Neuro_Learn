const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbUrl = process.env.SUPABASE_DB_URL;

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function updateSchemaAndRoles() {
  try {
    await client.connect();
    
    // Check if role column exists
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
    `);
    
    if (checkRes.rowCount === 0) {
      console.log('Adding "role" column to users table...');
      await client.query(`ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user'`);
    } else {
      console.log('"role" column already exists.');
    }

    // Update specific users to admin
    const admins = ['prajeethraj23@gmail.com', 'mdeeksha445@gmail.com'];
    console.log('Setting admin roles...');
    const updateRes = await client.query(`
      UPDATE public.users 
      SET role = 'admin' 
      WHERE email = ANY($1) 
      RETURNING email, role
    `, [admins]);
    
    console.log(`Updated ${updateRes.rowCount} users to admin.`);
    updateRes.rows.forEach(r => console.log(`- ${r.email}: ${r.role}`));

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
  }
}

updateSchemaAndRoles();
