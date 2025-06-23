import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDefaultPagesForExistingProjects1716994568007 implements MigrationInterface {
    name = 'CreateDefaultPagesForExistingProjects1716994568007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get all projects that don't have any pages
        const projectsWithoutPages = await queryRunner.query(`
            SELECT p.id, p.url 
            FROM "project" p 
            LEFT JOIN "page" pg ON p.id = pg."projectId" 
            WHERE pg.id IS NULL
        `);

        // Create default pages for projects that don't have any
        for (const project of projectsWithoutPages) {
            await queryRunner.query(`
                INSERT INTO "page" ("url", "projectId", "createdAt", "updatedAt")
                VALUES ($1, $2, NOW(), NOW())
            `, [project.url, project.id]);
        }

        console.log(`Created default pages for ${projectsWithoutPages.length} projects`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove default pages that were created by this migration
        // Note: This is a destructive operation and should be used carefully
        await queryRunner.query(`
            DELETE FROM "page" 
            WHERE "createdAt" >= NOW() - INTERVAL '1 minute'
        `);
    }
} 