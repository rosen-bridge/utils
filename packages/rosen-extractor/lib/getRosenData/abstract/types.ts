interface RosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  fromAddress: string;
  sourceChainTokenId: string;
  amount: bigint;
  targetChainTokenId: string;
  sourceTxId: string;
  sourceBlockId: string;
}

export { RosenData };
