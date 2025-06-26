import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPageIdToTasks1750771998136 implements MigrationInterface {
    name = 'AddPageIdToTasks1750771998136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add title column with default value for existing rows
        await queryRunner.query(`ALTER TABLE "page" ADD "title" character varying`);
        await queryRunner.query(`UPDATE "page" SET "title" = 'Page ' || id WHERE "title" IS NULL`);
        await queryRunner.query(`ALTER TABLE "page" ALTER COLUMN "title" SET NOT NULL`);
        
        await queryRunner.query(`ALTER TABLE "page" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "task" ADD "screenshotTitle" character varying`);
        // Add pageId as nullable for now
        await queryRunner.query(`ALTER TABLE "task" ADD "pageId" integer`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_17590b39c40b85991e036bc829d" FOREIGN KEY ("pageId") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        // NOTE: You must update all existing tasks to have a valid pageId before making this column NOT NULL.
        // After updating, you can run: ALTER TABLE "task" ALTER COLUMN "pageId" SET NOT NULL;
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_17590b39c40b85991e036bc829d"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "pageId"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "screenshotTitle"`);
        await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "title"`);
    }

}
