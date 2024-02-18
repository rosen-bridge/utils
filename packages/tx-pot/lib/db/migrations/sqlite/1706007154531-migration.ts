import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706007154531 implements MigrationInterface {
  name = 'Migration1706007154531';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "transaction_entity" (
                "txId" varchar NOT NULL,
                "chain" varchar NOT NULL,
                "txType" varchar NOT NULL,
                "status" varchar NOT NULL,
                "requiredSign" integer NOT NULL,
                "lastCheck" integer NOT NULL,
                "lastStatusUpdate" varchar NOT NULL,
                "failedInSign" boolean NOT NULL,
                "signFailedCount" integer NOT NULL,
                "serializedTx" varchar NOT NULL,
                "extra" varchar,
                "extra2" varchar,
                PRIMARY KEY ("txId", "chain")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "transaction_entity"
        `);
  }
}
