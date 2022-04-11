import {MigrationInterface, QueryRunner} from "typeorm";

export class DropUnusedTables1643316274220 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`meeting_dates_poll_entry_users_user\``);
        await queryRunner.query(`DROP TABLE \`meeting_participants_user\``);
    }

    // eslint-disable-next-line
    public async down(queryRunner: QueryRunner): Promise<void> {
        // This one is irreversible :(
        await Promise.resolve();
    }

}
