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

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate timestamp for backup filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilename = `backup-${timestamp}.sql`;
const backupPath = path.join(backupDir, backupFilename);

// Create pg_dump command
const pgDumpCommand = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USERNAME} -d ${DB_DATABASE} -f "${backupPath}"`;

console.log('Starting database backup...');
console.log(`Database: ${DB_DATABASE}`);
console.log(`Backup file: ${backupPath}`);

exec(pgDumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Backup failed:', error);
    return;
  }
  
  if (stderr) {
    console.warn('Backup warnings:', stderr);
  }
  
  console.log('Database backup completed successfully!');
  console.log(`Backup saved to: ${backupPath}`);
  
  // Get file size
  const stats = fs.statSync(backupPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`Backup size: ${fileSizeInMB} MB`);
}); 