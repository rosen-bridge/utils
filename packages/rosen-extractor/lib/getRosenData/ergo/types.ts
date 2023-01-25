interface ErgoRosenData {
  toChain: string;
  toAddress: string;
  networkFee: string;
  bridgeFee: string;
  fromAddress: string;
  tokenId: string;
  amount: bigint;
}

interface ExplorerAsset {
  tokenId: string;
  amount: bigint;
}

interface ExplorerAdditionalRegisters {
  R4?: string;
  R5?: string;
  R6?: string;
  R7?: string;
  R8?: string;
  R9?: string;
}

interface ExplorerOutputBox {
  boxId: string;
  value: bigint;
  ergoTree: string;
  creationHeight: bigint | number;
  assets?: Array<ExplorerAsset>;
  additionalRegisters?: ExplorerAdditionalRegisters;
  transactionId: string;
  index: bigint | number;
}

interface ExplorerInputBox {
  boxId: string;
}

interface ExplorerDataInput {
  boxId: string;
}

interface ExplorerTransaction {
  id: string;
  inputs: Array<ExplorerInputBox>;
  dataInputs: Array<ExplorerDataInput>;
  outputs: Array<ExplorerOutputBox>;
  size?: bigint;
}

export { ErgoRosenData, ExplorerOutputBox, ExplorerTransaction };
