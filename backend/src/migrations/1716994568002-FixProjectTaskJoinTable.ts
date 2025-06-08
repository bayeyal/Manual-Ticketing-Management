import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProjectTaskJoinTable1716994568002 implements MigrationInterface {
    name = 'FixProjectTaskJoinTable1716994568002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing join table if it exists
        await queryRunner.query(`DROP TABLE IF EXISTS "project__project_tasks"`);
        
        // Add projectId column to task table if it doesn't exist
        await queryRunner.query(`ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "projectId" integer`);
        
        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "task" 
            ADD CONSTRAINT "FK_task_project" 
            FOREIGN KEY ("projectId") 
            REFERENCES "projects"("id") 
            ON DELETE SET NULL
        `);
        
        // Create index for better performance
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