export interface FiroTxInput {
  txId: string;
  index: number;
  scriptPubKey: string;
}

export interface FiroTxOutput {
  scriptPubKey: string;
  value: bigint;
}

export interface FiroTx {
  id: string;
  inputs: FiroTxInput[];
  outputs: FiroTxOutput[];
}

// Transaction input types (in Firo getrawtransaction RPC response)
export interface FiroRpcTxInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  txinwitness?: string[];
}

// Transaction output types (in Firo getrawtransaction RPC response)
export interface FiroRpcTxOutput {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    reqSigs?: number;
    type: string;
    addresses?: string[];
  };
}

// Firo getrawtransaction RPC response
export interface FiroRpcTransaction {
  hex: string;
  txid: string;
  hash: string;
  size: number;
  vsize: number;
  version: number;
  locktime: number;
  vin: Array<FiroRpcTxInput>;
  vout: Array<FiroRpcTxOutput>;
  blockhash?: string;
  confirmations?: number;
  time?: number;
  blocktime?: number;
  instantlock?: boolean;
  chainlock?: boolean;
}
