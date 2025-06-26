const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get database configuration from environment variables
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_DATABASE = process.env.DB_DATABASE || 'ticketing_db';

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('Usage: node restore-database.js <backup-file>');
  console.error('Example: node restore-database.js backups/backup-2024-01-01T12-00-00-000Z.sql');
  process.exit(1);
}

const backupPath = path.isAbsolute(backupFile) ? backupFile : path.join(__dirname, backupFile);

// Check if backup file exists
if (!fs.existsSync(backupPath)) {
  console.error(`Backup file not found: ${backupPath}`);
  process.exit(1);
}

// Create environment object for cross-platform compatibility
const env = {
  ...process.env,
  PGPASSWORD: DB_PASSWORD
};

// Create psql command for restore (without PGPASSWORD in the command string)
const psqlCommand = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USERNAME} -d ${DB_DATABASE} -f "${backupPath}"`;

console.log('Starting database restore...');
console.log(`Database: ${DB_DATABASE}`);
console.log(`Backup file: ${backupPath}`);

// Confirm before proceeding
console.log('\n⚠️  WARNING: This will overwrite the current database!');
console.log('Press Ctrl+C to cancel or any key to continue...');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  
  exec(psqlCommand, { env }, (error, stdout, stderr) => {
    if (error) {
      console.error('Restore failed:', error);
      console.error('\nTroubleshooting tips:');
      console.error('1. Make sure PostgreSQL is installed and psql is in your PATH');
      console.error('2. Verify your database connection settings in .env file');
      console.error('3. Ensure the database exists and is accessible');
      return;
    }
    
    if (stderr) {
      console.warn('Restore warnings:', stderr);
    }
    
    console.log('Database restore completed successfully!');
    console.log(`Restored from: ${backupPath}`);
  });
}); 