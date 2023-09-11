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

interface ConfigBox {
  chains: Uint8Array[] | undefined;
  heights: string[][] | undefined;
  bridgeFees: string[][] | undefined;
  networkFees: string[][] | undefined;
  rsnRatios: string[][] | undefined;
  feeRatios: string[][] | undefined;
}

export { Fee, ChainFee, FeeConfig, ConfigBox };
