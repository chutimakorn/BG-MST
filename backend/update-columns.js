const { Client } = require('pg');
require('dotenv').config();

async function updateColumns() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    await client.query('ALTER TABLE job_orders ALTER COLUMN "poFileName" TYPE text');
    console.log('✓ Updated poFileName to text');

    await client.query('ALTER TABLE job_orders ALTER COLUMN "ivFileName" TYPE text');
    console.log('✓ Updated ivFileName to text');

    await client.query('ALTER TABLE job_orders ALTER COLUMN "itFileName" TYPE text');
    console.log('✓ Updated itFileName to text');

    console.log('\n✅ All columns updated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

updateColumns();
