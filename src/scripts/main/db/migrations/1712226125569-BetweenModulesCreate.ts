import { MigrationInterface, QueryRunner } from 'typeorm';

export class BetweenModulesCreate1712226125569 implements MigrationInterface {
  name = 'BetweenModulesCreate1712226125569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "BetweenModules" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" float NOT NULL, "token" varchar(255) NOT NULL, "network" varchar(255) NOT NULL, "wallet_id" varchar(255) NOT NULL, "index" integer)'
    );
    await queryRunner.query('CREATE INDEX "between-modules_walletId" ON "BetweenModules" ("wallet_id") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "between-modules_walletId"');
    await queryRunner.query('DROP TABLE "BetweenModules"');
  }
}
