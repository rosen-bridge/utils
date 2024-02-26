export interface BitcoinUtxo {
  txId: string;
  index: number;
  value: bigint;
}

export interface BoxInfo {
  id: string;
  assets: AssetBalance;
}

export interface TokenInfo {
  id: string;
  value: bigint;
}

export interface AssetBalance {
  nativeToken: bigint;
  tokens: Array<TokenInfo>;
}

export interface CoveringBoxes<BoxType> {
  covered: boolean;
  boxes: Array<BoxType>;
}
