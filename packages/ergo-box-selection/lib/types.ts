export type TokenAmountProxy = {
  readonly tokenId: string;
  readonly amount: string;
  readonly name?: string;
  readonly decimals?: number;
};

export type Registers = {
  [key: string]: string;
};

export type ErgoBoxProxy = {
  readonly boxId: string;
  readonly transactionId: string;
  readonly index: number;
  readonly ergoTree: string;
  readonly creationHeight: number;
  readonly value: string;
  readonly assets: TokenAmountProxy[];
  readonly additionalRegisters: Registers;
};

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

export type ErgoBoxCandidateProxy = Omit<
  ErgoBoxProxy,
  'boxId' | 'transactionId' | 'index'
>;
