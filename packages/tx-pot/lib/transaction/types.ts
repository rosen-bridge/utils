import { TransactionEntity } from '../db/entities/TransactionEntity';

export type ChainRequiredConfirmations = Record<string, number>; // tx type => required number
export type RequiredConfirmations = Record<string, ChainRequiredConfirmations>;

export type ValidatorFunction = (tx: TransactionEntity) => Promise<boolean>;
export type CallbackFunction = (
  tx: TransactionEntity,
  newStatus: TransactionStatus
) => Promise<void>;

export enum TransactionStatus {
  APPROVED = 'approved',
  IN_SIGN = 'in-sign',
  SIGN_FAILED = 'sign-failed',
  SIGNED = 'signed',
  SENT = 'sent',
  INVALID = 'invalid',
  COMPLETED = 'completed',
}

export enum SigningStatus {
  Signed,
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
  extra?: FieldValue<string>;
}

export class UnregisteredChain extends Error {
  constructor(msg: string) {
    super('UnregisteredChain: ' + msg);
  }
}
