import {MigrationInterface, QueryRunner} from "typeorm";

export class ExpenseNew1621786614201 implements MigrationInterface {
    name = 'ExpenseNew1621786614201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `expense_users_user` (`expenseId` int NOT NULL, `userId` int NOT NULL, INDEX `IDX_c6a351a97e6c3e2981ba103f3d` (`expenseId`), INDEX `IDX_9e1bc9a0c7bbbe044000af6c1c` (`userId`), PRIMARY KEY (`expenseId`, `userId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `expense` ADD `meetingId` int NOT NULL");
        await queryRunner.query("ALTER TABLE `expense` ADD CONSTRAINT `FK_b70a293546383f5eaeda69e16b3` FOREIGN KEY (`meetingId`) REFERENCES `meeting`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `expense_users_user` ADD CONSTRAINT `FK_c6a351a97e6c3e2981ba103f3d8` FOREIGN KEY (`expenseId`) REFERENCES `expense`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `expense_users_user` ADD CONSTRAINT `FK_9e1bc9a0c7bbbe044000af6c1c5` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `expense_users_user` DROP FOREIGN KEY `FK_9e1bc9a0c7bbbe044000af6c1c5`");
        await queryRunner.query("ALTER TABLE `expense_users_user` DROP FOREIGN KEY `FK_c6a351a97e6c3e2981ba103f3d8`");
        await queryRunner.query("ALTER TABLE `expense` DROP FOREIGN KEY `FK_b70a293546383f5eaeda69e16b3`");
        await queryRunner.query("ALTER TABLE `expense` DROP COLUMN `meetingId`");
        await queryRunner.query("DROP INDEX `IDX_9e1bc9a0c7bbbe044000af6c1c` ON `expense_users_user`");
        await queryRunner.query("DROP INDEX `IDX_c6a351a97e6c3e2981ba103f3d` ON `expense_users_user`");
        await queryRunner.query("DROP TABLE `expense_users_user`");
    }

}
