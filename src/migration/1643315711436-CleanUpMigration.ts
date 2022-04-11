import {MigrationInterface, QueryRunner} from "typeorm";

export class CleanUpMigration1643315711436 implements MigrationInterface {
    name = 'CleanUpMigration1643315711436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`expense_users_user\` DROP FOREIGN KEY \`FK_9e1bc9a0c7bbbe044000af6c1c5\``);
        await queryRunner.query(`ALTER TABLE \`expense_users_user\` DROP FOREIGN KEY \`FK_c6a351a97e6c3e2981ba103f3d8\``);
        await queryRunner.query(`ALTER TABLE \`announcement\` DROP FOREIGN KEY \`FK_fd25dfe3da37df1715f11ba6ec8\``);
        await queryRunner.query(`ALTER TABLE \`announcement\` DROP FOREIGN KEY \`FK_7116f075a4b3c3308109f5cfd12\``);
        await queryRunner.query(`ALTER TABLE \`announcement\` CHANGE \`userId\` \`userId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`announcement\` CHANGE \`meetingId\` \`meetingId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`announcement\` ADD CONSTRAINT \`FK_fd25dfe3da37df1715f11ba6ec8\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`announcement\` ADD CONSTRAINT \`FK_7116f075a4b3c3308109f5cfd12\` FOREIGN KEY (\`meetingId\`) REFERENCES \`meeting\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense_users_user\` ADD CONSTRAINT \`FK_c6a351a97e6c3e2981ba103f3d8\` FOREIGN KEY (\`expenseId\`) REFERENCES \`expense\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`expense_users_user\` ADD CONSTRAINT \`FK_9e1bc9a0c7bbbe044000af6c1c5\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`expense_users_user\` DROP FOREIGN KEY \`FK_9e1bc9a0c7bbbe044000af6c1c5\``);
        await queryRunner.query(`ALTER TABLE \`expense_users_user\` DROP FOREIGN KEY \`FK_c6a351a97e6c3e2981ba103f3d8\``);
        await queryRunner.query(`ALTER TABLE \`announcement\` DROP FOREIGN KEY \`FK_7116f075a4b3c3308109f5cfd12\``);
        await queryRunner.query(`ALTER TABLE \`announcement\` DROP FOREIGN KEY \`FK_fd25dfe3da37df1715f11ba6ec8\``);
        await queryRunner.query(`ALTER TABLE \`announcement\` CHANGE \`meetingId\` \`meetingId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`announcement\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`announcement\` ADD CONSTRAINT \`FK_7116f075a4b3c3308109f5cfd12\` FOREIGN KEY (\`meetingId\`) REFERENCES \`meeting\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`announcement\` ADD CONSTRAINT \`FK_fd25dfe3da37df1715f11ba6ec8\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense_users_user\` ADD CONSTRAINT \`FK_c6a351a97e6c3e2981ba103f3d8\` FOREIGN KEY (\`expenseId\`) REFERENCES \`expense\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expense_users_user\` ADD CONSTRAINT \`FK_9e1bc9a0c7bbbe044000af6c1c5\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
