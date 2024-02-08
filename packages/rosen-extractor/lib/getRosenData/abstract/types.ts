interface RosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  fromAddress: string;
  sourceChainTokenId: string;
  amount: string;
  targetChainTokenId: string;
  sourceTxId: string;
}

interface TokenTransformation {
  from: string;
  to: string;
  amount: string;
}

export { RosenData, TokenTransformation };
