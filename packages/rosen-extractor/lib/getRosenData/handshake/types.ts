export interface OpReturnData {
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
  vout: Array<{
    value: number;
    n: number;
    address: {
      version: number;
      hash: string;
      string: string;
    };
    covenant?: {
      type: number;
      items: string[];
    };
  }>;
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
}

export interface HandshakeTx {
  id: string;
  inputs: HandshakeTxInput[];
  outputs: HandshakeTxOutput[];
}
