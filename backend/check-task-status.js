const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'accessibility_db',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkTaskStatus() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check tasks 14 and 15 specifically
    const tasksQuery = `
      SELECT id, title, status, "projectId"
      FROM task 
      WHERE id IN (14, 15)
      ORDER BY id
    `;
    
    const tasksResult = await client.query(tasksQuery);
    const tasks = tasksResult.rows;
    
    console.log('\n=== Current Task Status ===');
    tasks.forEach(task => {
      console.log(`Task ${task.id}: "${task.title}" - Status: ${task.status} - Project: ${task.projectId}`);
    });

    // Check project 2 progress
    const projectQuery = `
      SELECT id, name, progress, status
      FROM project 
      WHERE id = 2
    `;
    
    const projectResult = await client.query(projectQuery);
    const project = projectResult.rows[0];
    
    console.log('\n=== Project 2 Status ===');
    console.log(`Name: ${project.name}`);
    console.log(`Progress: ${project.progress}%`);
    console.log(`Status: ${project.status}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTaskStatus(); 