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
