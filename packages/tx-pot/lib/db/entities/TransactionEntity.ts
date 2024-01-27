import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TransactionEntity {
  @PrimaryColumn('varchar')
  txId: string;

  @PrimaryColumn('varchar')
  chain: string;

  @Column('varchar')
  txType: string;

  @Column('varchar')
  status: string;

  @Column('integer')
  requiredSign: number;

  @Column('integer')
  lastCheck: number;

  @Column('varchar')
  lastStatusUpdate: string;

  @Column('boolean')
  failedInSign: boolean;

  @Column('integer')
  signFailedCount: number;

  @Column('varchar')
  serializedTx: string;

  @Column('varchar', {
    nullable: true,
  })
  extra?: string;

  @Column('varchar', {
    nullable: true,
  })
  extra2?: string;
}
