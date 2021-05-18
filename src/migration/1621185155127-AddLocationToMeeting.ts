import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLocationToMeeting1621185155127 implements MigrationInterface {
    name = 'AddLocationToMeeting1621185155127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `meeting` ADD `locationId` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `meeting` ADD `locationString` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `meeting` DROP COLUMN `locationString`");
        await queryRunner.query("ALTER TABLE `meeting` DROP COLUMN `locationId`");
    }

}
