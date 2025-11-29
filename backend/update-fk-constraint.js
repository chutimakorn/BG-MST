const { Client } = require('pg');
require('dotenv').config();

async function updateForeignKey() {
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

    // Drop old constraint
    await client.query(`
      ALTER TABLE quotations 
      DROP CONSTRAINT IF EXISTS "FK_f8726ce7930a4aaec3beaa5fde6"
    `);
    console.log('✓ Dropped old foreign key constraint');

    // Add new constraint with ON DELETE SET NULL
    await client.query(`
      ALTER TABLE quotations 
      ADD CONSTRAINT "FK_f8726ce7930a4aaec3beaa5fde6" 
      FOREIGN KEY ("jobOrderId") 
      REFERENCES job_orders(id) 
      ON DELETE SET NULL
    `);
    console.log('✓ Added new foreign key constraint with ON DELETE SET NULL');

    console.log('\n✅ Foreign key constraint updated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

updateForeignKey();
