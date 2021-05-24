import {MigrationInterface, QueryRunner} from "typeorm";

export class MigrationName1621994818987 implements MigrationInterface {
    name = 'MigrationName1621994818987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `expense` DROP COLUMN `amount`");
        await queryRunner.query("ALTER TABLE `expense` ADD `amount` double NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `expense` DROP COLUMN `amount`");
        await queryRunner.query("ALTER TABLE `expense` ADD `amount` int NOT NULL");
    }

}
