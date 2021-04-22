import {MigrationInterface, QueryRunner} from "typeorm";

export class AddMeetings1618665399168 implements MigrationInterface {
    name = 'AddMeetings1618665399168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `meeting_dates_poll_entry` (`id` int NOT NULL AUTO_INCREMENT, `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleteDate` datetime(6) NULL, `startDate` datetime NOT NULL, `endDate` datetime NOT NULL, `meetingId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `meeting` (`id` int NOT NULL AUTO_INCREMENT, `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleteDate` datetime(6) NULL, `name` varchar(255) NOT NULL, `description` varchar(255) NOT NULL, `startDate` datetime NULL, `endDate` datetime NULL, `status` enum ('0', '1', '2', '3', '4', '5') NOT NULL DEFAULT '0', `isDatesPollActive` tinyint NOT NULL, `canUsersAddPollEntries` tinyint NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `meeting_dates_poll_entry_users_user` (`meetingDatesPollEntryId` int NOT NULL, `userId` int NOT NULL, INDEX `IDX_2a33f5f5a11b707d1ba0617718` (`meetingDatesPollEntryId`), INDEX `IDX_36336598447fe28419b2f1d0f1` (`userId`), PRIMARY KEY (`meetingDatesPollEntryId`, `userId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` ADD `name` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `lastName` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `meeting_dates_poll_entry` ADD CONSTRAINT `FK_581084c7c00b04462a678a07200` FOREIGN KEY (`meetingId`) REFERENCES `meeting`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `meeting_dates_poll_entry_users_user` ADD CONSTRAINT `FK_2a33f5f5a11b707d1ba06177185` FOREIGN KEY (`meetingDatesPollEntryId`) REFERENCES `meeting_dates_poll_entry`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `meeting_dates_poll_entry_users_user` ADD CONSTRAINT `FK_36336598447fe28419b2f1d0f12` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `meeting_dates_poll_entry_users_user` DROP FOREIGN KEY `FK_36336598447fe28419b2f1d0f12`");
        await queryRunner.query("ALTER TABLE `meeting_dates_poll_entry_users_user` DROP FOREIGN KEY `FK_2a33f5f5a11b707d1ba06177185`");
        await queryRunner.query("ALTER TABLE `meeting_dates_poll_entry` DROP FOREIGN KEY `FK_581084c7c00b04462a678a07200`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `lastName`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `name`");
        await queryRunner.query("DROP INDEX `IDX_36336598447fe28419b2f1d0f1` ON `meeting_dates_poll_entry_users_user`");
        await queryRunner.query("DROP INDEX `IDX_2a33f5f5a11b707d1ba0617718` ON `meeting_dates_poll_entry_users_user`");
        await queryRunner.query("DROP TABLE `meeting_dates_poll_entry_users_user`");
        await queryRunner.query("DROP TABLE `meeting`");
        await queryRunner.query("DROP TABLE `meeting_dates_poll_entry`");
    }

}
