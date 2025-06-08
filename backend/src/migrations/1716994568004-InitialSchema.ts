import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1716994568004 implements MigrationInterface {
    name = 'InitialSchema1716994568004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop all foreign key constraints
        await queryRunner.query(`
            DO $$ 
            DECLARE 
                r RECORD;
            BEGIN
                FOR r IN (
                    SELECT tc.table_schema, tc.table_name, tc.constraint_name
                    FROM information_schema.table_constraints tc
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = 'public'
                    AND tc.table_name IN (
                        'project_assigned_users',
                        'project_auditors',
                        'task_message',
                        'task',
                        'project',
                        'user'
                    )
                ) 
                LOOP
                    EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                            ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
                END LOOP;
            END $$;
        `);

        // Drop existing tables if they exist (in correct order)
        await queryRunner.query(`DROP TABLE IF EXISTS "project_assigned_users" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "project_auditors" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "task_message" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "task" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "project" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);

        // Create user table
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL PRIMARY KEY,
                "firstName" varchar NOT NULL,
                "lastName" varchar NOT NULL,
                "email" varchar NOT NULL UNIQUE,
                "password" varchar NOT NULL,
                "role" varchar NOT NULL DEFAULT 'USER',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create project table
        await queryRunner.query(`
            CREATE TABLE "project" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar NOT NULL,
                "description" text,
                "url" varchar NOT NULL,
                "auditType" varchar NOT NULL DEFAULT 'WCAG_2_1',
                "auditLevel" varchar NOT NULL DEFAULT 'AA',
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "dueDate" TIMESTAMP NOT NULL,
                "status" varchar NOT NULL DEFAULT 'NEW',
                "progress" integer NOT NULL DEFAULT 0,
                "projectAdminId" integer REFERENCES "user"("id"),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create task table
        await queryRunner.query(`
            CREATE TABLE "task" (
                "id" SERIAL PRIMARY KEY,
                "title" varchar NOT NULL,
                "description" text NOT NULL,
                "wcagCriteria" varchar NOT NULL,
                "wcagVersion" varchar NOT NULL,
                "conformanceLevel" varchar NOT NULL,
                "defectSummary" text,
                "recommendation" text,
                "userImpact" text,
                "comments" text,
                "disabilityType" varchar,
                "pageUrl" varchar NOT NULL,
                "screenshot" varchar,
                "severity" varchar NOT NULL DEFAULT 'MODERATE',
                "status" varchar NOT NULL DEFAULT 'NEW',
                "priority" varchar NOT NULL DEFAULT 'MEDIUM',
                "assignedToId" integer REFERENCES "user"("id"),
                "auditorId" integer REFERENCES "user"("id"),
                "projectId" integer REFERENCES "project"("id") ON DELETE SET NULL,
                "dueDate" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create task_message table
        await queryRunner.query(`
            CREATE TABLE "task_message" (
                "id" SERIAL PRIMARY KEY,
                "content" text NOT NULL,
                "taskId" integer REFERENCES "task"("id") ON DELETE CASCADE,
                "userId" integer REFERENCES "user"("id"),
                "mentionedUserId" integer REFERENCES "user"("id"),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create project_auditors join table
        await queryRunner.query(`
            CREATE TABLE "project_auditors" (
                "projectId" integer REFERENCES "project"("id") ON DELETE CASCADE,
                "userId" integer REFERENCES "user"("id") ON DELETE CASCADE,
                PRIMARY KEY ("projectId", "userId")
            )
        `);

        // Create project_assigned_users join table
        await queryRunner.query(`
            CREATE TABLE "project_assigned_users" (
                "projectId" integer REFERENCES "project"("id") ON DELETE CASCADE,
                "userId" integer REFERENCES "user"("id") ON DELETE CASCADE,
                PRIMARY KEY ("projectId", "userId")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_user_email" ON "user" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_task_project" ON "task" ("projectId")`);
        await queryRunner.query(`CREATE INDEX "IDX_task_assigned" ON "task" ("assignedToId")`);
        await queryRunner.query(`CREATE INDEX "IDX_task_auditor" ON "task" ("auditorId")`);
        await queryRunner.query(`CREATE INDEX "IDX_task_message_task" ON "task_message" ("taskId")`);
        await queryRunner.query(`CREATE INDEX "IDX_task_message_user" ON "task_message" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_project_admin" ON "project" ("projectAdminId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order with CASCADE
        await queryRunner.query(`DROP TABLE IF EXISTS "project_assigned_users" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "project_auditors" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "task_message" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "task" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "project" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
    }
} 