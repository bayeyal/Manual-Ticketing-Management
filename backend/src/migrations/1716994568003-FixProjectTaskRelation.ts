import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProjectTaskRelation1716994568003 implements MigrationInterface {
    name = 'FixProjectTaskRelation1716994568003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop any existing join tables
        await queryRunner.query(`DROP TABLE IF EXISTS "project__project_tasks"`);
        
        // Drop existing foreign key if it exists
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT IF EXISTS "FK_3797a20ef5553ae87af126bc2fe"`);
        
        // Drop existing index if it exists
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_3797a20ef5553ae87af126bc2f"`);
        
        // Add projectId column if it doesn't exist
        await queryRunner.query(`ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "projectId" integer`);
        
        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "task" 
            ADD CONSTRAINT "FK_task_project" 
            FOREIGN KEY ("projectId") 
            REFERENCES "projects"("id") 
            ON DELETE SET NULL
        `);
        
        // Create index
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_task_project" ON "task" ("projectId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT IF EXISTS "FK_task_project"`);
        
        // Drop index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_project"`);
        
        // Drop projectId column
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN IF EXISTS "projectId"`);
    }
} 