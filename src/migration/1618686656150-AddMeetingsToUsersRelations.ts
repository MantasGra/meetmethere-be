import {MigrationInterface, QueryRunner} from "typeorm";

export class AddMeetingsToUsersRelations1618686656150 implements MigrationInterface {
    name = 'AddMeetingsToUsersRelations1618686656150'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `meeting_participants_user` (`meetingId` int NOT NULL, `userId` int NOT NULL, INDEX `IDX_00e85b1ef8ba02143d4afda01c` (`meetingId`), INDEX `IDX_888360c104337e11fbfe4eda83` (`userId`), PRIMARY KEY (`meetingId`, `userId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `meeting` ADD `creatorId` int NULL");
        await queryRunner.query("ALTER TABLE `meeting` ADD CONSTRAINT `FK_fe775c687e31ff7950e35650c40` FOREIGN KEY (`creatorId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `meeting_participants_user` ADD CONSTRAINT `FK_00e85b1ef8ba02143d4afda01c5` FOREIGN KEY (`meetingId`) REFERENCES `meeting`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `meeting_participants_user` ADD CONSTRAINT `FK_888360c104337e11fbfe4eda837` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `meeting_participants_user` DROP FOREIGN KEY `FK_888360c104337e11fbfe4eda837`");
        await queryRunner.query("ALTER TABLE `meeting_participants_user` DROP FOREIGN KEY `FK_00e85b1ef8ba02143d4afda01c5`");
        await queryRunner.query("ALTER TABLE `meeting` DROP FOREIGN KEY `FK_fe775c687e31ff7950e35650c40`");
        await queryRunner.query("ALTER TABLE `meeting` DROP COLUMN `creatorId`");
        await queryRunner.query("DROP INDEX `IDX_888360c104337e11fbfe4eda83` ON `meeting_participants_user`");
        await queryRunner.query("DROP INDEX `IDX_00e85b1ef8ba02143d4afda01c` ON `meeting_participants_user`");
        await queryRunner.query("DROP TABLE `meeting_participants_user`");
    }

}
