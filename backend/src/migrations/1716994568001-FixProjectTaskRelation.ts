import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProjectTaskRelation1716994568001 implements MigrationInterface {
    name = 'FixProjectTaskRelation1716994568001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing foreign key constraints
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT IF EXISTS "FK_3797a20ef5553ae87af126bc2fe"`);
        
        // Drop existing index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_3797a20ef5553ae87af126bc2f"`);
        
        // Add projectId column if it doesn't exist
        await queryRunner.query(`ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "projectId" integer`);
        
        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // Create index
        await queryRunner.query(`CREATE INDEX "IDX_3797a20ef5553ae87af126bc2f" ON "task" ("projectId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`);
        
        // Drop index
        await queryRunner.query(`DROP INDEX "IDX_3797a20ef5553ae87af126bc2f"`);
        
        // Drop projectId column
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "projectId"`);
    }
} 