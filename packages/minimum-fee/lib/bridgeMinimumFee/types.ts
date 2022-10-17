interface Fee {
  [key: string]: {
    bridgeFee: string;
    networkFee: string;
    rsnRatio: string;
  };
}

interface FeeConfig {
  [key: string]: Fee;
}

export { Fee, FeeConfig };
