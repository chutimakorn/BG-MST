const { Client } = require('pg');
require('dotenv').config();

async function fixJobOrderDates() {
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

    // Check current dates
    const checkResult = await client.query(`
      SELECT id, "quotationNumber", "submissionDate", 
             EXTRACT(YEAR FROM "submissionDate") as year
      FROM job_orders 
      WHERE "submissionDate" IS NOT NULL
      ORDER BY id
    `);
    
    console.log('\nCurrent Job Orders:');
    console.log(checkResult.rows);

    // Update dates: Convert Gregorian year (2024, 2025) to Buddhist year (+543)
    const updateResult = await client.query(`
      UPDATE job_orders 
      SET "submissionDate" = "submissionDate" + INTERVAL '543 years'
      WHERE EXTRACT(YEAR FROM "submissionDate") < 2500
      AND "submissionDate" IS NOT NULL
    `);
    
    console.log(`\nUpdated ${updateResult.rowCount} job order dates`);

    // Also update deliveryDate if exists
    const updateDeliveryResult = await client.query(`
      UPDATE job_orders 
      SET "deliveryDate" = "deliveryDate" + INTERVAL '543 years'
      WHERE EXTRACT(YEAR FROM "deliveryDate") < 2500
      AND "deliveryDate" IS NOT NULL
    `);
    
    console.log(`Updated ${updateDeliveryResult.rowCount} delivery dates`);

    // Check after update
    const afterResult = await client.query(`
      SELECT id, "quotationNumber", "submissionDate", 
             EXTRACT(YEAR FROM "submissionDate") as year
      FROM job_orders 
      WHERE "submissionDate" IS NOT NULL
      ORDER BY id
    `);
    
    console.log('\nAfter Update:');
    console.log(afterResult.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixJobOrderDates();
