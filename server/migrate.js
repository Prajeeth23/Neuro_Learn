require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error('SUPABASE_DB_URL is not set in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    console.log(`Reading schema from ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    await client.query(schemaSql);
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
