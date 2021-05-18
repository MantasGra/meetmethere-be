import {MigrationInterface, QueryRunner} from "typeorm";

export class MakeLocationNullable1621186090133 implements MigrationInterface {
    name = 'MakeLocationNullable1621186090133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `meeting` CHANGE `locationId` `locationId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `meeting` CHANGE `locationString` `locationString` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `meeting` CHANGE `locationString` `locationString` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `meeting` CHANGE `locationId` `locationId` varchar(255) NOT NULL");
    }

}
