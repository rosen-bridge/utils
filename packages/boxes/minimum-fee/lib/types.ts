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
  readonly feeRatioDivisor: bigint = 10000n;

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
