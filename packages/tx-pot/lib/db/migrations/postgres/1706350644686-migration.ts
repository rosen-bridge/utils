import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706350644686 implements MigrationInterface {
  name = 'Migration1706350644686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "transaction_entity" (
                "txId" character varying NOT NULL,
                "chain" character varying NOT NULL,
                "txType" character varying NOT NULL,
                "status" character varying NOT NULL,
                "requiredSign" integer NOT NULL,
                "lastCheck" integer NOT NULL,
                "lastStatusUpdate" character varying NOT NULL,
                "failedInSign" boolean NOT NULL,
                "signFailedCount" integer NOT NULL,
                "serializedTx" character varying NOT NULL,
                "extra" character varying,
                "extra2" character varying,
                CONSTRAINT "PK_cafcc9d8e76fef57bc0cf385caa" PRIMARY KEY ("txId", "chain")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "transaction_entity"
        `);
  }
}
