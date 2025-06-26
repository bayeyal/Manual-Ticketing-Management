const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function fixTaskPages() {
  return new Promise((resolve, reject) => {
    console.log('Connecting to database...');
    
    // First, let's see what tasks we have and their current page assignments
    db.all(`
      SELECT 
        t.id as task_id, 
        t.title as task_title, 
        t.pageId,
        p.id as page_id, 
        p.title as page_title
      FROM task t
      LEFT JOIN page p ON t.pageId = p.id
      WHERE t.projectId = 2
      ORDER BY t.id
    `, [], (err, tasks) => {
      if (err) {
        console.error('Error querying tasks:', err);
        reject(err);
        return;
      }
      
      console.log('\nCurrent task assignments:');
      tasks.forEach(task => {
        console.log(`Task ${task.task_id} (${task.task_title}) -> Page ${task.page_id || 'NULL'} (${task.page_title || 'None'})`);
      });
      
      // Get all pages for project 2
      db.all(`
        SELECT id, title 
        FROM page 
        WHERE projectId = 2 
        ORDER BY id
      `, [], (err, pages) => {
        if (err) {
          console.error('Error querying pages:', err);
          reject(err);
          return;
        }
        
        console.log(`\nFound ${pages.length} pages for project 2:`, pages);
        
        if (pages.length === 0) {
          console.log('No pages found for project 2');
          resolve();
          return;
        }
        
        // Get tasks without page assignment
        db.all(`
          SELECT id, title 
          FROM task 
          WHERE projectId = 2 AND pageId IS NULL
          ORDER BY id
        `, [], (err, tasksWithoutPage) => {
          if (err) {
            console.error('Error querying tasks without page:', err);
            reject(err);
            return;
          }
          
          console.log(`\nFound ${tasksWithoutPage.length} tasks without page assignment:`, tasksWithoutPage);
          
          if (tasksWithoutPage.length === 0) {
            console.log('All tasks already have page assignments');
            resolve();
            return;
          }
          
          // Assign tasks to pages in round-robin fashion
          let updateCount = 0;
          tasksWithoutPage.forEach((task, index) => {
            const pageIndex = index % pages.length;
            const page = pages[pageIndex];
            
            console.log(`Assigning task ${task.id} (${task.title}) to page ${page.id} (${page.title})`);
            
            db.run(`
              UPDATE task 
              SET pageId = ? 
              WHERE id = ?
            `, [page.id, task.id], function(err) {
              if (err) {
                console.error(`Error updating task ${task.id}:`, err);
              } else {
                updateCount++;
                console.log(`Updated task ${task.id} -> page ${page.id}`);
                
                if (updateCount === tasksWithoutPage.length) {
                  console.log('\nAll tasks updated successfully!');
                  
                  // Verify the updates
                  db.all(`
                    SELECT 
                      t.id as task_id, 
                      t.title as task_title, 
                      t.pageId,
                      p.id as page_id, 
                      p.title as page_title
                    FROM task t
                    LEFT JOIN page p ON t.pageId = p.id
                    WHERE t.projectId = 2
                    ORDER BY t.id
                  `, [], (err, updatedTasks) => {
                    if (err) {
                      console.error('Error verifying updates:', err);
                    } else {
                      console.log('\nUpdated task assignments:');
                      updatedTasks.forEach(task => {
                        console.log(`Task ${task.task_id} (${task.task_title}) -> Page ${task.page_id || 'NULL'} (${task.page_title || 'None'})`);
                      });
                    }
                    db.close();
                    resolve();
                  });
                }
              }
            });
          });
        });
      });
    });
  });
}

fixTaskPages().catch(console.error); 