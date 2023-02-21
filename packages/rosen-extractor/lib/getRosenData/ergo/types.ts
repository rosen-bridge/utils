interface NodeAsset {
  tokenId: string;
  amount: bigint;
}

interface NodeAdditionalRegisters {
  R4?: string;
  R5?: string;
  R6?: string;
  R7?: string;
  R8?: string;
  R9?: string;
}

interface NodeOutputBox {
  boxId: string;
  value: bigint;
  ergoTree: string;
  creationHeight: bigint | number;
  assets?: Array<NodeAsset>;
  additionalRegisters?: NodeAdditionalRegisters;
  transactionId: string;
  index: bigint | number;
}

interface NodeInputBox {
  boxId: string;
}

interface NodeDataInput {
  boxId: string;
}

interface NodeTransaction {
  id: string;
  inputs: Array<NodeInputBox>;
  dataInputs: Array<NodeDataInput>;
  outputs: Array<NodeOutputBox>;
  size?: bigint;
}

interface TokenTransformation {
  from: string;
  to: string;
  amount: bigint;
}

export { NodeOutputBox, NodeTransaction, TokenTransformation };
