import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialUser1617636415470 implements MigrationInterface {
    name = 'InitialUser1617636415470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deleteDate` datetime(6) NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `user`");
    }

}
