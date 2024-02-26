import { TransactionEntity, TransactionStatus } from '../../lib';

export const currentTimeStamp = 1685894400001;
export const currentTimeStampAsSeconds = 1685894400;

export const tx1: TransactionEntity = {
  txId: 'tx-id-1',
  chain: 'chain-1',
  txType: 'tx-A',
  status: TransactionStatus.APPROVED,
  requiredSign: 1,
  lastCheck: 10010,
  lastStatusUpdate: '1685894400',
  failedInSign: false,
  signFailedCount: 0,
  serializedTx: 'serialized-tx-1',
};

export const tx2: TransactionEntity = {
  txId: 'tx-id-2',
  chain: 'chain-1',
  txType: 'tx-A',
  status: TransactionStatus.INVALID,
  requiredSign: 1,
  lastCheck: 0,
  lastStatusUpdate: '1685894220',
  failedInSign: false,
  signFailedCount: 0,
  serializedTx: 'serialized-tx-2',
};

export const tx3: TransactionEntity = {
  txId: 'tx-id-3',
  chain: 'chain-2',
  txType: 'tx-A',
  status: TransactionStatus.IN_SIGN,
  requiredSign: 2,
  lastCheck: 0,
  lastStatusUpdate: '1685894220',
  failedInSign: true,
  signFailedCount: 1,
  serializedTx: 'serialized-tx-3',
  extra: 'extra-1',
};

export const tx4: TransactionEntity = {
  txId: 'tx-id-4',
  chain: 'chain-1',
  txType: 'tx-B',
  status: TransactionStatus.SIGNED,
  requiredSign: 0,
  lastCheck: 0,
  lastStatusUpdate: '1685894220',
  failedInSign: true,
  signFailedCount: 1,
  serializedTx: 'serialized-tx-4',
  extra: 'extra-2',
};

export const tx5: TransactionEntity = {
  txId: 'tx-id-5',
  chain: 'chain-2',
  txType: 'tx-B',
  status: TransactionStatus.IN_SIGN,
  requiredSign: 0,
  lastCheck: 0,
  lastStatusUpdate: '1685894220',
  failedInSign: false,
  signFailedCount: 0,
  serializedTx: 'serialized-tx-5',
};

export const tx6: TransactionEntity = {
  txId: 'tx-id-6',
  chain: 'chain-2',
  txType: 'tx-B',
  status: TransactionStatus.SENT,
  requiredSign: 0,
  lastCheck: 0,
  lastStatusUpdate: '1685894220',
  failedInSign: false,
  signFailedCount: 0,
  serializedTx: 'serialized-tx-6',
};
