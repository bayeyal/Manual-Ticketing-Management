const axios = require('axios');

async function testTaskUpdate() {
  try {
    console.log('Testing task update API...');
    
    // First, let's get the current state of task 15
    const taskResponse = await axios.get('http://localhost:3001/api/tasks/15');
    console.log('Current task 15:', JSON.stringify(taskResponse.data, null, 2));
    
    // Update task 15 status to COMPLETED (even though it might already be)
    const updateData = {
      status: 'COMPLETED'
    };
    
    console.log('Updating task 15 with data:', JSON.stringify(updateData, null, 2));
    
    const updateResponse = await axios.patch('http://localhost:3001/api/tasks/15', updateData);
    console.log('Task update response:', JSON.stringify(updateResponse.data, null, 2));
    
    // Wait a moment for the progress calculation to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check the project progress
    const projectResponse = await axios.get('http://localhost:3001/api/projects/2');
    console.log('Project 2 after update:', JSON.stringify(projectResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testTaskUpdate(); 