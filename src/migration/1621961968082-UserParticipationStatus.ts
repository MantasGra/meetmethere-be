import {MigrationInterface, QueryRunner} from "typeorm";

export class UserParticipationStatus1621961968082 implements MigrationInterface {
    name = 'UserParticipationStatus1621961968082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_participation_status` (`id` int NOT NULL AUTO_INCREMENT, `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleteDate` datetime(6) NULL, `userParticipationStatus` varchar(255) NOT NULL, `participantId` int NULL, `meetingId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_participation_status` ADD CONSTRAINT `FK_c5268986b3197f18114d658e7d9` FOREIGN KEY (`participantId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_participation_status` ADD CONSTRAINT `FK_48a7431796669fc26589f13b630` FOREIGN KEY (`meetingId`) REFERENCES `meeting`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_participation_status` DROP FOREIGN KEY `FK_48a7431796669fc26589f13b630`");
        await queryRunner.query("ALTER TABLE `user_participation_status` DROP FOREIGN KEY `FK_c5268986b3197f18114d658e7d9`");
        await queryRunner.query("DROP TABLE `user_participation_status`");
    }

}
