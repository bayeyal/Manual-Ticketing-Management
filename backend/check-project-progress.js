const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'accessibility_db',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkProjectProgress() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check project 2 progress
    const projectQuery = `
      SELECT id, name, progress, status
      FROM project 
      WHERE id = 2
    `;
    
    const projectResult = await client.query(projectQuery);
    const project = projectResult.rows[0];
    
    console.log('\n=== Project 2 Current Status ===');
    console.log(`Name: ${project.name}`);
    console.log(`Progress: ${project.progress}%`);
    console.log(`Status: ${project.status}`);

    // Check tasks for project 2
    const tasksQuery = `
      SELECT id, title, status
      FROM task 
      WHERE "projectId" = 2
      ORDER BY id
    `;
    
    const tasksResult = await client.query(tasksQuery);
    const tasks = tasksResult.rows;
    
    console.log('\n=== Tasks for Project 2 ===');
    tasks.forEach(task => {
      console.log(`Task ${task.id}: "${task.title}" - Status: ${task.status}`);
    });

    // Calculate expected progress
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    const expectedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    console.log('\n=== Progress Analysis ===');
    console.log(`Total tasks: ${totalTasks}`);
    console.log(`Completed tasks: ${completedTasks}`);
    console.log(`Expected progress: ${expectedProgress}%`);
    console.log(`Actual progress in DB: ${project.progress}%`);
    
    if (expectedProgress !== project.progress) {
      console.log('❌ MISMATCH: Progress needs to be updated');
    } else {
      console.log('✅ Progress is correct');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkProjectProgress(); 