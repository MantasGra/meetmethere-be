import {MigrationInterface, QueryRunner} from "typeorm";

export class Activity1621882630270 implements MigrationInterface {
    name = 'Activity1621882630270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `activity` (`id` int NOT NULL AUTO_INCREMENT, `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleteDate` datetime(6) NULL, `name` varchar(255) NOT NULL, `description` varchar(255) NOT NULL, `startTime` datetime NOT NULL, `endTime` datetime NOT NULL, `meetingId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `activity` ADD CONSTRAINT `FK_d031d089b84fc3a54ae15139caf` FOREIGN KEY (`meetingId`) REFERENCES `meeting`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `activity` DROP FOREIGN KEY `FK_d031d089b84fc3a54ae15139caf`");
        await queryRunner.query("DROP TABLE `activity`");
    }

}
