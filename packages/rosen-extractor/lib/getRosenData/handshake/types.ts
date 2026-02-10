export interface HandshakeRosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
}

export interface HandshakeRpcTxInput {
  txid: string;
  vout: number;
  txinwitness: Array<string>;
  sequence: number;
}

export interface HandshakeRpcTxOutput {
  value: number;
  n: number;
  address: {
    version: number;
    hash: string;
    string: string;
  };
  covenant: {
    type: number;
    action: string;
    items: string[];
  };
}

export interface HandshakeRpcTransaction {
  txid: string;
  version: number;
  size: number;
  vsize: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    txinwitness?: string[];
    sequence: number;
  }>;
  vout: Array<HandshakeRpcTxOutput>;
  hash: string;
}

export interface HandshakeTxInput {
  txId: string;
  index: number;
}

export interface HandshakeTxOutput {
  value: bigint;
  address: {
    version: number;
    hash: string;
    string: string;
  };
  covenant: {
    type: number;
    action: string;
    items: string[];
  };
}

export interface DataExtractionOutput {
  value: bigint;
  address?: { hash: string; version?: number };
}

export interface HandshakeTx {
  id: string;
  inputs: HandshakeTxInput[];
  outputs: HandshakeTxOutput[];
}
