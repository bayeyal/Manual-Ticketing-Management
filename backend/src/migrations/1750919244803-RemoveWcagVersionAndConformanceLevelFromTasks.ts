import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveWcagVersionAndConformanceLevelFromTasks1750919244803 implements MigrationInterface {
    name = 'RemoveWcagVersionAndConformanceLevelFromTasks1750919244803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "wcagVersion"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "conformanceLevel"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_17590b39c40b85991e036bc829d"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "pageId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_17590b39c40b85991e036bc829d" FOREIGN KEY ("pageId") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_17590b39c40b85991e036bc829d"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "pageId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_17590b39c40b85991e036bc829d" FOREIGN KEY ("pageId") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD "conformanceLevel" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ADD "wcagVersion" character varying NOT NULL`);
    }

}
