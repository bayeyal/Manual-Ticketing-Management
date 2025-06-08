import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class CreateDefaultUser1716994568005 implements MigrationInterface {
    name = 'CreateDefaultUser1716994568005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hashedPassword = await bcrypt.hash('test123456', 10);
        
        await queryRunner.query(`
            INSERT INTO "user" (
                "firstName",
                "lastName",
                "email",
                "password",
                "role",
                "createdAt",
                "updatedAt"
            ) VALUES (
                'Eyal',
                'Bar',
                'eyal@allyable.com',
                '${hashedPassword}',
                'SUPER_ADMIN',
                NOW(),
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "user" WHERE email = 'eyal@allyable.com'
        `);
    }
} 