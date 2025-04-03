export interface OpReturnData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
}

export interface EsploraTxInput {
  txid: string;
  vout: number;
  prevout: {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
  };
  scriptsig: string;
  scriptsig_asm: string;
  is_coinbase: false;
  sequence: number;
}

export interface EsploraTxOutput {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface DogeEsploraTransaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<EsploraTxInput>;
  vout: Array<EsploraTxOutput>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: true;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

export interface DogeTxInput {
  txId: string;
  index: number;
  scriptPubKey: string;
}

export interface DogeTxOutput {
  scriptPubKey: string;
  value: bigint;
}

export interface DogeTx {
  id: string;
  inputs: DogeTxInput[];
  outputs: DogeTxOutput[];
}

export interface DogeRpcTxInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
}

export interface DogeRpcTxOutput {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    type: string;
  };
}

export interface DogeRpcTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  locktime: number;
  vin: Array<DogeRpcTxInput>;
  vout: Array<DogeRpcTxOutput>;
}

export interface DogeBlockcypherTxInput {
  prev_hash: string;
  output_index: number;
  script: string;
  output_value: number;
  sequence: number;
  addresses: string[];
  script_type: string;
}

export interface DogeBlockcypherTxOutput {
  value: number;
  script: string;
  addresses: string[];
  script_type: string;
  spent_by?: string;
}

export interface DogeBlockcypherTransaction {
  hash: string;
  ver: number;
  vin_sz: number;
  vout_sz: number;
  size: number;
  weight: number;
  fee: number;
  relayed_by: string;
  lock_time: number;
  txid: string;
  confidence: number;
  confirmed: string;
  received: string;
  double_spend: boolean;
  inputs: DogeBlockcypherTxInput[];
  outputs: DogeBlockcypherTxOutput[];
  block_height?: number;
  block_hash?: string;
  confirmations: number;
  hex?: string;
}
