/** BCH RPC metadata. Raw hex, rather than JSON decimal values, owns amounts. */
export interface BitcoinCashRpcTokenData {
  category: string;
  amount: string;
  nft?: { capability: 'none' | 'mutable' | 'minting'; commitment: string };
}

export interface BitcoinCashRpcTxInput {
  txid?: string;
  vout?: number;
  coinbase?: string;
  scriptSig?: { asm?: string; hex: string };
  sequence?: number;
}

export interface BitcoinCashRpcTxOutput {
  value: number | string;
  n: number;
  scriptPubKey: {
    hex: string;
    asm?: string;
    type?: string;
    addresses?: string[];
  };
  tokenData?: BitcoinCashRpcTokenData | null;
}

export interface BitcoinCashRpcTransaction {
  hex: string;
  txid: string;
  vin: BitcoinCashRpcTxInput[];
  vout: BitcoinCashRpcTxOutput[];
  hash?: string;
  size?: number;
  version?: number;
  locktime?: number;
  blockhash?: string;
  confirmations?: number;
  time?: number;
  blocktime?: number;
}
