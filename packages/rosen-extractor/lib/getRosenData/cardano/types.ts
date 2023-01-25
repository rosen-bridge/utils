interface CardanoRosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  fromAddress: string;
}

interface MetaData {
  [key: string]: JSON;
}

export { CardanoRosenData, MetaData };
