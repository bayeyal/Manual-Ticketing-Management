import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTaskTableSchema1716994568008 implements MigrationInterface {
    name = 'FixTaskTableSchema1716994568008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if pageUrl column exists and remove it
        const hasPageUrlColumn = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'task' AND column_name = 'pageUrl'
        `);

        if (hasPageUrlColumn.length > 0) {
            console.log('Removing pageUrl column from task table');
            await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "pageUrl"`);
        }

        // Ensure pageId column exists and is properly configured
        const hasPageIdColumn = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'task' AND column_name = 'pageId'
        `);

        if (hasPageIdColumn.length === 0) {
            console.log('Adding pageId column to task table');
            await queryRunner.query(`
                ALTER TABLE "task" ADD COLUMN "pageId" integer REFERENCES "page"("id") ON DELETE CASCADE
            `);
        }

        // Update existing tasks to have a default page if they don't have one
        await queryRunner.query(`
            UPDATE "task" 
            SET "pageId" = (
                SELECT p.id 
                FROM "page" p 
                WHERE p."projectId" = "task"."projectId" 
                LIMIT 1
            )
            WHERE "pageId" IS NULL
        `);

        console.log('Task table schema fixed');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is not easily reversible
        console.log('Warning: This migration cannot be safely reversed');
    }
} 