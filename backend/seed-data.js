const { Client } = require('pg');

async function seedData() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'accessibility_db'
  });

  try {
    await client.connect();
    console.log('Connected to database for seeding...');

    // Get the default user
    const userResult = await client.query(`
      SELECT id FROM "user" WHERE email = 'eyal@allyable.com'
    `);
    
    if (userResult.rows.length === 0) {
      console.log('Default user not found. Please make sure migrations have run.');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log('Found user with ID:', userId);

    // Create sample projects
    const project1 = await client.query(`
      INSERT INTO "project" (
        "name", "description", "url", "auditType", "auditLevel", 
        "startDate", "endDate", "dueDate", "status", "progress", "projectAdminId"
      ) VALUES (
        'E-commerce Website Audit',
        'Comprehensive accessibility audit for our main e-commerce platform',
        'https://example-store.com',
        'WCAG_2_1',
        'AA',
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW() + INTERVAL '30 days',
        'IN_PROGRESS',
        25,
        $1
      ) RETURNING id
    `, [userId]);

    const project2 = await client.query(`
      INSERT INTO "project" (
        "name", "description", "url", "auditType", "auditLevel", 
        "startDate", "endDate", "dueDate", "status", "progress", "projectAdminId"
      ) VALUES (
        'Mobile App Accessibility',
        'Accessibility review for our mobile application',
        'https://mobile.example.com',
        'WCAG_2_1',
        'AA',
        NOW(),
        NOW() + INTERVAL '45 days',
        NOW() + INTERVAL '45 days',
        'NEW',
        0,
        $1
      ) RETURNING id
    `, [userId]);

    const project1Id = project1.rows[0].id;
    const project2Id = project2.rows[0].id;

    console.log('Created projects with IDs:', project1Id, project2Id);

    // Create sample tasks for project 1
    await client.query(`
      INSERT INTO "task" (
        "title", "description", "wcagCriteria", "wcagVersion", "conformanceLevel",
        "defectSummary", "recommendation", "userImpact", "pageUrl", "severity", 
        "status", "priority", "assignedToId", "auditorId", "projectId", "dueDate"
      ) VALUES (
        'Missing Alt Text on Product Images',
        'Product images lack alternative text descriptions',
        '1.1.1',
        '2.1',
        'A',
        'Images without alt text prevent screen reader users from understanding product information',
        'Add descriptive alt text to all product images',
        'Screen reader users cannot understand what products look like',
        'https://example-store.com/products',
        'HIGH',
        'IN_PROGRESS',
        'HIGH',
        $1,
        $1,
        $2,
        NOW() + INTERVAL '7 days'
      )
    `, [userId, project1Id]);

    await client.query(`
      INSERT INTO "task" (
        "title", "description", "wcagCriteria", "wcagVersion", "conformanceLevel",
        "defectSummary", "recommendation", "userImpact", "pageUrl", "severity", 
        "status", "priority", "assignedToId", "auditorId", "projectId", "dueDate"
      ) VALUES (
        'Color Contrast Issues',
        'Text color contrast does not meet WCAG AA standards',
        '1.4.3',
        '2.1',
        'AA',
        'Light gray text on white background has insufficient contrast',
        'Increase text contrast to meet 4.5:1 ratio for normal text',
        'Users with low vision cannot read the text',
        'https://example-store.com/checkout',
        'MODERATE',
        'NEW',
        'MEDIUM',
        $1,
        $1,
        $2,
        NOW() + INTERVAL '14 days'
      )
    `, [userId, project1Id]);

    // Create sample task for project 2
    await client.query(`
      INSERT INTO "task" (
        "title", "description", "wcagCriteria", "wcagVersion", "conformanceLevel",
        "defectSummary", "recommendation", "userImpact", "pageUrl", "severity", 
        "status", "priority", "assignedToId", "auditorId", "projectId", "dueDate"
      ) VALUES (
        'Touch Target Size',
        'Mobile app buttons are too small for easy interaction',
        '2.5.5',
        '2.1',
        'AA',
        'Touch targets are smaller than 44x44 pixels',
        'Increase touch target size to at least 44x44 pixels',
        'Users with motor disabilities cannot easily tap buttons',
        'https://mobile.example.com/login',
        'HIGH',
        'NEW',
        'HIGH',
        $1,
        $1,
        $2,
        NOW() + INTERVAL '10 days'
      )
    `, [userId, project2Id]);

    console.log('Sample data seeded successfully!');
    console.log('Default user: eyal@allyable.com / test123456');
    console.log('Created 2 projects with sample tasks');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.end();
  }
}

seedData(); 