const { Client } = require('pg');
const fs = require('fs');
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
    let result = {};
    for (const table of tables) {
      const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);
      result[table] = res.rows;
    }
    fs.writeFileSync('schema.json', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

inspectSchema();
