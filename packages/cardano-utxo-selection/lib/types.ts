export interface CardanoAsset {
  policyId: string;
  assetName: string;
  quantity: bigint;
}

export interface CardanoUtxo {
  txId: string;
  index: number;
  value: bigint;
  assets: Array<CardanoAsset>;
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
