const { Client } = require('pg');

async function fixUserRole() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'accessibility_db'
  });

  try {
    await client.connect();
    console.log('Connected to database...');

    // Update the user role to SUPER_ADMIN
    const result = await client.query(`
      UPDATE "user" 
      SET "role" = 'SUPER_ADMIN'
      WHERE email = 'eyal@allyable.com'
      RETURNING id, email, "firstName", "lastName", role
    `);

    if (result.rows.length > 0) {
      console.log('✅ User role updated successfully:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('Error fixing user role:', error);
  } finally {
    await client.end();
  }
}

fixUserRole(); 