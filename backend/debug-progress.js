const { Client } = require('pg');

// PostgreSQL connection configuration - you'll need to update these values
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'accessibility_db',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function debugProgress() {
  try {
    console.log('Attempting to connect to database...');
    console.log('Connection config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_DATABASE || 'accessibility_db',
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD ? '***' : 'postgres'
    });
    
    await client.connect();
    console.log('Connected to PostgreSQL');

    const projectId = 2;

    // First, let's check if the project table exists and has data
    console.log('\n=== Checking Database Tables ===');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('project', 'task')
      ORDER BY table_name
    `);
    console.log('Available tables:', tablesResult.rows.map(row => row.table_name));

    // Check all projects
    const allProjectsResult = await client.query(`
      SELECT id, name, progress, status
      FROM project 
      ORDER BY id
    `);
    console.log(`\n=== All Projects in Database ===`);
    console.log(`Total projects found: ${allProjectsResult.rows.length}`);
    allProjectsResult.rows.forEach(project => {
      console.log(`Project ${project.id}: "${project.name}" - Progress: ${project.progress}% - Status: ${project.status}`);
    });

    // Get project info
    const projectQuery = `
      SELECT id, name, progress, status
      FROM project 
      WHERE id = $1
    `;
    
    const projectResult = await client.query(projectQuery, [projectId]);
    
    if (projectResult.rows.length === 0) {
      console.log(`\n❌ Project ${projectId} not found in database!`);
      return;
    }
    
    const project = projectResult.rows[0];
    
    console.log(`\n=== Project ${projectId} Info ===`);
    console.log(`Name: ${project.name}`);
    console.log(`Current progress in DB: ${project.progress}%`);
    console.log(`Status: ${project.status}`);

    // Get all tasks for project 2
    const tasksQuery = `
      SELECT id, title, status, "projectId", "pageId"
      FROM task 
      WHERE "projectId" = $1
      ORDER BY id
    `;
    
    const tasksResult = await client.query(tasksQuery, [projectId]);
    const tasks = tasksResult.rows;
    
    console.log(`\n=== Tasks for Project ${projectId} ===`);
    console.log(`Total tasks found: ${tasks.length}`);
    
    if (tasks.length === 0) {
      console.log(`❌ No tasks found for project ${projectId}!`);
      
      // Let's check all tasks to see what's in the database
      const allTasksResult = await client.query(`
        SELECT id, title, status, "projectId"
        FROM task 
        ORDER BY id
      `);
      console.log(`\n=== All Tasks in Database ===`);
      console.log(`Total tasks found: ${allTasksResult.rows.length}`);
      allTasksResult.rows.forEach(task => {
        console.log(`Task ${task.id}: "${task.title}" - Status: ${task.status} - ProjectId: ${task.projectid}`);
      });
      return;
    }
    
    tasks.forEach(task => {
      console.log(`Task ${task.id}: "${task.title}" - Status: ${task.status} - PageId: ${task.pageid}`);
    });

    // Count completed tasks
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
    const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    
    console.log(`\n=== Progress Calculation ===`);
    console.log(`Total tasks: ${tasks.length}`);
    console.log(`Completed tasks: ${completedTasks.length}`);
    console.log(`Calculated progress: ${completedTasks.length}/${tasks.length} = ${progress}%`);
    console.log(`Expected progress: 50% (1 completed out of 2 total)`);
    
    if (progress !== project.progress) {
      console.log(`\n❌ MISMATCH: Database shows ${project.progress}% but calculation shows ${progress}%`);
      
      // Update the progress
      const updateQuery = `
        UPDATE project 
        SET progress = $1 
        WHERE id = $2
      `;
      
      await client.query(updateQuery, [progress, projectId]);
      console.log(`✅ Updated project progress to ${progress}%`);
    } else {
      console.log(`\n✅ Progress matches: ${progress}%`);
    }

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    console.error('Full error:', error);
  } finally {
    try {
      await client.end();
      console.log('Database connection closed');
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
}

debugProgress(); 