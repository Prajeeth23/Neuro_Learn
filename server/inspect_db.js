const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dbUrl = process.env.SUPABASE_DB_URL;

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function inspectSchema() {
  try {
    await client.connect();
    
    const tables = ['users', 'courses', 'modules'];
    
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);
      res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

inspectSchema();
