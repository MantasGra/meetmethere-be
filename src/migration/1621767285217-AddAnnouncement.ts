import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAnnouncement1621767285217 implements MigrationInterface {
    name = 'AddAnnouncement1621767285217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `announcement` (`id` int NOT NULL AUTO_INCREMENT, `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleteDate` datetime(6) NULL, `title` varchar(255) NOT NULL, `description` text NOT NULL, `userId` int NULL, `meetingId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `announcement` ADD CONSTRAINT `FK_fd25dfe3da37df1715f11ba6ec8` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `announcement` ADD CONSTRAINT `FK_7116f075a4b3c3308109f5cfd12` FOREIGN KEY (`meetingId`) REFERENCES `meeting`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `announcement` DROP FOREIGN KEY `FK_7116f075a4b3c3308109f5cfd12`");
        await queryRunner.query("ALTER TABLE `announcement` DROP FOREIGN KEY `FK_fd25dfe3da37df1715f11ba6ec8`");
        await queryRunner.query("DROP TABLE `announcement`");
    }

}
