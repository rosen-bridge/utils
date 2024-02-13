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

export interface BitcoinEsploraTransaction {
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

export interface BitcoinTxInput {
  txId: string;
  index: number;
  scriptPubKey: string;
}

export interface BitcoinTxOutput {
  scriptPubKey: string;
  value: bigint;
}

export interface BitcoinTx {
  id: string;
  inputs: BitcoinTxInput[];
  outputs: BitcoinTxOutput[];
}
