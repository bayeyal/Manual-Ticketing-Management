const { Client } = require('pg');

// PostgreSQL connection configuration
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'accessibility_db',
  user: 'postgres', // replace with your username
  password: 'password', // replace with your password
});

async function testProgress() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Test project 2
    const projectId = 2;

    // Get all tasks for project 2
    const tasksQuery = `
      SELECT id, title, status, "projectId", "pageId"
      FROM task 
      WHERE "projectId" = $1
      ORDER BY id
    `;
    
    const tasksResult = await client.query(tasksQuery, [projectId]);
    const tasks = tasksResult.rows;
    
    console.log(`\n=== Project ${projectId} Tasks ===`);
    console.log(`Total tasks found: ${tasks.length}`);
    
    tasks.forEach(task => {
      console.log(`Task ${task.id}: "${task.title}" - Status: ${task.status} - PageId: ${task.pageid}`);
    });

    // Count completed tasks
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
    const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    
    console.log(`\n=== Progress Calculation ===`);
    console.log(`Total tasks: ${tasks.length}`);
    console.log(`Completed tasks: ${completedTasks.length}`);
    console.log(`Progress: ${completedTasks.length}/${tasks.length} = ${progress}%`);

    // Check current project progress
    const projectQuery = `
      SELECT id, name, progress, status
      FROM project 
      WHERE id = $1
    `;
    
    const projectResult = await client.query(projectQuery, [projectId]);
    const project = projectResult.rows[0];
    
    console.log(`\n=== Current Project State ===`);
    console.log(`Project ${project.id}: "${project.name}"`);
    console.log(`Current progress in DB: ${project.progress}%`);
    console.log(`Current status: ${project.status}`);

    // Update progress
    const updateQuery = `
      UPDATE project 
      SET progress = $1 
      WHERE id = $2
    `;
    
    await client.query(updateQuery, [progress, projectId]);
    console.log(`\nUpdated project progress to ${progress}%`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

testProgress(); 