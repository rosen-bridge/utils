interface Fee {
  bridgeFee: bigint;
  networkFee: bigint;
  rsnRatio: bigint;
  feeRatio: bigint;
}

interface ChainFee {
  [key: string]: Fee;
}

interface FeeConfig {
  [key: string]: ChainFee;
}

export { Fee, ChainFee, FeeConfig };
