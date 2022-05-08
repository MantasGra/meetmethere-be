import {MigrationInterface, QueryRunner} from "typeorm";

export class PasswordResetToken1651943720674 implements MigrationInterface {
    name = 'PasswordResetToken1651943720674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`passwordResetToken\` varchar(16) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`meeting_dates_poll_entry\` DROP FOREIGN KEY \`FK_581084c7c00b04462a678a07200\``);
        await queryRunner.query(`ALTER TABLE \`meeting_dates_poll_entry\` CHANGE \`meetingId\` \`meetingId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` DROP FOREIGN KEY \`FK_3269df418a36026a7d2b3f035b1\``);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` DROP FOREIGN KEY \`FK_3c34df8c29e9357ff19efe1e079\``);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` CHANGE \`meetingDatesPollEntryId\` \`meetingDatesPollEntryId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` CHANGE \`userId\` \`userId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` DROP FOREIGN KEY \`FK_c5268986b3197f18114d658e7d9\``);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` DROP FOREIGN KEY \`FK_48a7431796669fc26589f13b630\``);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` CHANGE \`participantId\` \`participantId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` CHANGE \`meetingId\` \`meetingId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`meeting_dates_poll_entry\` ADD CONSTRAINT \`FK_581084c7c00b04462a678a07200\` FOREIGN KEY (\`meetingId\`) REFERENCES \`meeting\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` ADD CONSTRAINT \`FK_3269df418a36026a7d2b3f035b1\` FOREIGN KEY (\`meetingDatesPollEntryId\`) REFERENCES \`meeting_dates_poll_entry\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` ADD CONSTRAINT \`FK_3c34df8c29e9357ff19efe1e079\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` ADD CONSTRAINT \`FK_c5268986b3197f18114d658e7d9\` FOREIGN KEY (\`participantId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` ADD CONSTRAINT \`FK_48a7431796669fc26589f13b630\` FOREIGN KEY (\`meetingId\`) REFERENCES \`meeting\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` DROP FOREIGN KEY \`FK_48a7431796669fc26589f13b630\``);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` DROP FOREIGN KEY \`FK_c5268986b3197f18114d658e7d9\``);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` DROP FOREIGN KEY \`FK_3c34df8c29e9357ff19efe1e079\``);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` DROP FOREIGN KEY \`FK_3269df418a36026a7d2b3f035b1\``);
        await queryRunner.query(`ALTER TABLE \`meeting_dates_poll_entry\` DROP FOREIGN KEY \`FK_581084c7c00b04462a678a07200\``);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` CHANGE \`meetingId\` \`meetingId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` CHANGE \`participantId\` \`participantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` ADD CONSTRAINT \`FK_48a7431796669fc26589f13b630\` FOREIGN KEY (\`meetingId\`) REFERENCES \`meeting\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_participation_status\` ADD CONSTRAINT \`FK_c5268986b3197f18114d658e7d9\` FOREIGN KEY (\`participantId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` CHANGE \`meetingDatesPollEntryId\` \`meetingDatesPollEntryId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` ADD CONSTRAINT \`FK_3c34df8c29e9357ff19efe1e079\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_meeting_dates_poll_entry\` ADD CONSTRAINT \`FK_3269df418a36026a7d2b3f035b1\` FOREIGN KEY (\`meetingDatesPollEntryId\`) REFERENCES \`meeting_dates_poll_entry\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`meeting_dates_poll_entry\` CHANGE \`meetingId\` \`meetingId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`meeting_dates_poll_entry\` ADD CONSTRAINT \`FK_581084c7c00b04462a678a07200\` FOREIGN KEY (\`meetingId\`) REFERENCES \`meeting\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`passwordResetToken\``);
    }

}
