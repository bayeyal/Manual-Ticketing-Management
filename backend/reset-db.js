const { Client } = require('pg');

async function resetDatabase() {
  // Connect to PostgreSQL without specifying a database (connect to postgres default database)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Drop the database if it exists
    console.log('Dropping database if it exists...');
    await client.query(`
      DROP DATABASE IF EXISTS accessibility_db;
    `);

    // Create the database
    console.log('Creating new database...');
    await client.query(`
      CREATE DATABASE accessibility_db;
    `);

    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDatabase(); 