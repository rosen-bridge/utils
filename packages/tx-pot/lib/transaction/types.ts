import { TransactionEntity } from '../db/entities/transactionEntity';

export type ChainRequiredConfirmations = Record<string, number>; // tx type => required number
export type RequiredConfirmations = Record<string, ChainRequiredConfirmations>;

// eslint-disable-next-line no-unused-vars
export type ValidatorFunction = (tx: TransactionEntity) => Promise<boolean>;
export type CallbackFunction = (
  // eslint-disable-next-line no-unused-vars
  tx: TransactionEntity,
  // eslint-disable-next-line no-unused-vars
  newStatus: TransactionStatus,
) => Promise<void>;

export enum TransactionStatus {
  // eslint-disable-next-line no-unused-vars
  APPROVED = 'approved',
  // eslint-disable-next-line no-unused-vars
  IN_SIGN = 'in-sign',
  // eslint-disable-next-line no-unused-vars
  SIGN_FAILED = 'sign-failed',
  // eslint-disable-next-line no-unused-vars
  SIGNED = 'signed',
  // eslint-disable-next-line no-unused-vars
  SENT = 'sent',
  // eslint-disable-next-line no-unused-vars
  INVALID = 'invalid',
  // eslint-disable-next-line no-unused-vars
  COMPLETED = 'completed',
}

export enum SigningStatus {
  // eslint-disable-next-line no-unused-vars
  Signed,
  // eslint-disable-next-line no-unused-vars
  UnSigned,
}

export type FieldValue<T> = T | Array<T>;
export interface FieldOption<T> {
  not: boolean;
  value: FieldValue<T>;
}

export interface TxOptions {
  txId?: FieldValue<string>;
  chain?: string;
  txType?: string;
  status?: FieldOption<TransactionStatus>;
  failedInSign?: boolean;
  extra?: FieldValue<string | null>;
}

export class UnregisteredChain extends Error {
  constructor(msg: string) {
    super('UnregisteredChain: ' + msg);
  }
}
