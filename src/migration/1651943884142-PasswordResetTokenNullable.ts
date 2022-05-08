import {MigrationInterface, QueryRunner} from "typeorm";

export class PasswordResetTokenNullable1651943884142 implements MigrationInterface {
    name = 'PasswordResetTokenNullable1651943884142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`passwordResetToken\` \`passwordResetToken\` varchar(16) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`passwordResetToken\` \`passwordResetToken\` varchar(16) NOT NULL`);
    }

}
