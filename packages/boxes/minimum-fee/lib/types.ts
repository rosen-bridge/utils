import { Constant } from 'ergo-lib-wasm-nodejs';
import { FEE_RATIO_DIVISOR } from './constants';

export interface Fee {
  heights: { [key: string]: number };
  configs: { [key: string]: ChainFee };
}

export interface ChainFee {
  bridgeFee: bigint;
  networkFee: bigint;
  rsnRatio: bigint;
  rsnRatioDivisor: bigint;
  feeRatio: bigint;
}

export class ChainMinimumFee implements ChainFee {
  bridgeFee: bigint;
  networkFee: bigint;
  rsnRatio: bigint;
  rsnRatioDivisor: bigint;
  feeRatio: bigint;
  readonly feeRatioDivisor: bigint = FEE_RATIO_DIVISOR;

  constructor(chainFee: ChainFee) {
    this.bridgeFee = chainFee.bridgeFee;
    this.networkFee = chainFee.networkFee;
    this.rsnRatio = chainFee.rsnRatio;
    this.rsnRatioDivisor = chainFee.rsnRatioDivisor;
    this.feeRatio = chainFee.feeRatio;
  }
}

export enum ErgoNetworkType {
  explorer = 'explorer',

  node = 'node',
}

export interface RegisterValues {
  R4: Constant;
  R5: Constant;
  R6: Constant;
  R7: Constant;
  R8: Constant;
  R9: Constant;
}

export type AdditionalRegisters = {
  R4: string;
  R5: string;
  R6: string;
  R7: string;
  R8: string;
  R9: string;
};

export type ErgoBoxWrapper = {
  boxId: string;
  txId: string;
  address: string;
  index: number;
  value: bigint;
  creationHeight: number;
  assets: { tokenId: string; amount: bigint }[];
  additionalRegisters: AdditionalRegisters;
  ergoTree: string;
  globalIndex: bigint;
  spentTransactionId?: string;
};
