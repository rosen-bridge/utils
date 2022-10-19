interface Fee {
  [key: string]: {
    bridgeFee: bigint;
    networkFee: bigint;
    rsnRatio: bigint;
  };
}

interface FeeConfig {
  [key: string]: Fee;
}

export { Fee, FeeConfig };
