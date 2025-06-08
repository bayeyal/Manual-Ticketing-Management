import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTaskDescription1716994568000 implements MigrationInterface {
    name = 'UpdateTaskDescription1716994568000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, update any null descriptions to empty string
        await queryRunner.query(`UPDATE "task" SET "description" = '' WHERE "description" IS NULL`);
        
        // Then change the column type to text and make it non-nullable
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "description" TYPE text USING description::text`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "description" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the changes
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "description" TYPE varchar USING description::varchar`);
    }
} 