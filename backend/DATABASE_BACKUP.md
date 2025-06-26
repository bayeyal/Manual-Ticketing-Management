# Database Backup and Restore

This document explains how to backup and restore your PostgreSQL database.

## Prerequisites

Make sure you have PostgreSQL client tools installed:
- `pg_dump` for creating backups
- `psql` for restoring backups

## Backup Database

To create a backup of your database:

```bash
cd backend
npm run backup:db
```

This will:
1. Create a `backups/` directory if it doesn't exist
2. Generate a timestamped backup file (e.g., `backup-2024-01-01T12-00-00-000Z.sql`)
3. Save the complete database structure and data

## Restore Database

To restore from a backup:

```bash
cd backend
npm run restore:db <backup-file>
```

Example:
```bash
npm run restore:db backups/backup-2024-01-01T12-00-00-000Z.sql
```

⚠️ **Warning**: This will overwrite your current database!

## Manual Commands

If you prefer to run the commands manually:

### Backup
```bash
PGPASSWORD="your_password" pg_dump -h localhost -p 5432 -U your_username -d your_database -f backup.sql
```

### Restore
```bash
PGPASSWORD="your_password" psql -h localhost -p 5432 -U your_username -d your_database -f backup.sql
```

## Environment Variables

Make sure your `.env` file contains the correct database configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
```

## Git Integration

- Database backups are automatically excluded from Git (see `.gitignore`)
- Backups are stored locally in the `backend/backups/` directory
- Consider storing important backups in a separate location (cloud storage, etc.)

## Best Practices

1. **Regular Backups**: Create backups before major changes
2. **Test Restores**: Periodically test your restore process
3. **Multiple Locations**: Store backups in multiple locations
4. **Version Control**: Keep your database schema in version control (migrations)
5. **Documentation**: Document any custom data or configurations 