const { Client } = require('pg');
require('dotenv').config();

async function addJobPdfColumn() {
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

    // Add jobPdfFileName column
    await client.query(`
      ALTER TABLE job_orders 
      ADD COLUMN IF NOT EXISTS "jobPdfFileName" text
    `);
    console.log('✓ Added jobPdfFileName column');

    console.log('\n✅ Column added successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

addJobPdfColumn();
