import {MigrationInterface, QueryRunner} from "typeorm";

export class Polls1621893690096 implements MigrationInterface {
    name = 'Polls1621893690096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_meeting_dates_poll_entry` (`id` int NOT NULL AUTO_INCREMENT, `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleteDate` datetime(6) NULL, `meetingDatesPollEntryId` int NULL, `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_meeting_dates_poll_entry` ADD CONSTRAINT `FK_3269df418a36026a7d2b3f035b1` FOREIGN KEY (`meetingDatesPollEntryId`) REFERENCES `meeting_dates_poll_entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_meeting_dates_poll_entry` ADD CONSTRAINT `FK_3c34df8c29e9357ff19efe1e079` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_meeting_dates_poll_entry` DROP FOREIGN KEY `FK_3c34df8c29e9357ff19efe1e079`");
        await queryRunner.query("ALTER TABLE `user_meeting_dates_poll_entry` DROP FOREIGN KEY `FK_3269df418a36026a7d2b3f035b1`");
        await queryRunner.query("DROP TABLE `user_meeting_dates_poll_entry`");
    }

}
