const { Client } = require('pg');

async function testProgressCalculation() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'accessibility_db'
  });

  try {
    await client.connect();
    console.log('Connected to database for testing...');

    // Test project 1
    const projectId = 1;
    
    // Get all pages for project 1
    const pagesResult = await client.query(`
      SELECT id, url FROM page WHERE "projectId" = $1
    `, [projectId]);
    
    console.log(`Found ${pagesResult.rows.length} pages for project ${projectId}:`);
    pagesResult.rows.forEach(page => {
      console.log(`  Page ${page.id}: ${page.url}`);
    });

    // Get all tasks from all pages in project 1
    const tasksResult = await client.query(`
      SELECT t.id, t.title, t.status, t."pageId", p.url as page_url
      FROM task t
      JOIN page p ON t."pageId" = p.id
      WHERE p."projectId" = $1
    `, [projectId]);
    
    console.log(`\nFound ${tasksResult.rows.length} tasks for project ${projectId}:`);
    tasksResult.rows.forEach(task => {
      console.log(`  Task ${task.id}: "${task.title}" - Status: ${task.status} (Page: ${task.page_url})`);
    });

    // Calculate progress
    const totalTasks = tasksResult.rows.length;
    const completedTasks = tasksResult.rows.filter(task => task.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    console.log(`\nProgress Calculation:`);
    console.log(`  Total tasks: ${totalTasks}`);
    console.log(`  Completed tasks: ${completedTasks}`);
    console.log(`  Progress: ${progress}%`);

    // Update project progress
    await client.query(`
      UPDATE project SET progress = $1 WHERE id = $2
    `, [progress, projectId]);
    
    console.log(`\nUpdated project ${projectId} progress to ${progress}%`);

    // Verify the update
    const projectResult = await client.query(`
      SELECT id, name, progress FROM project WHERE id = $1
    `, [projectId]);
    
    console.log(`\nProject ${projectId} current progress: ${projectResult.rows[0]?.progress}%`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

testProgressCalculation(); 