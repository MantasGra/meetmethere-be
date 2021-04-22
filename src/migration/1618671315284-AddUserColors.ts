import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserColors1618671315284 implements MigrationInterface {
    name = 'AddUserColors1618671315284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `color` enum ('#33658A', '#86BBD8', '#758E4F', '#F6AE2D', '#F26419', '#160F29', '#F3DFC1', '#DDBEA8', '#FAFFD8', '#D6A2AD') NOT NULL DEFAULT '#33658A'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `color`");
    }

}
