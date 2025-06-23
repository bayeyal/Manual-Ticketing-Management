import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePagesTable1716994568006 implements MigrationInterface {
    name = 'CreatePagesTable1716994568006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create page table
        await queryRunner.query(`
            CREATE TABLE "page" (
                "id" SERIAL PRIMARY KEY,
                "url" varchar NOT NULL,
                "projectId" integer REFERENCES "project"("id") ON DELETE CASCADE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Add pageId column to task table
        await queryRunner.query(`
            ALTER TABLE "task" ADD COLUMN "pageId" integer REFERENCES "page"("id") ON DELETE CASCADE
        `);

        // Create index for page lookups
        await queryRunner.query(`CREATE INDEX "IDX_page_project" ON "page" ("projectId")`);
        await queryRunner.query(`CREATE INDEX "IDX_task_page" ON "task" ("pageId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove pageId column from task table
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN IF EXISTS "pageId"`);
        
        // Drop page table
        await queryRunner.query(`DROP TABLE IF EXISTS "page" CASCADE`);
    }
} 