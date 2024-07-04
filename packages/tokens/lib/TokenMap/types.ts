export type RosenTokens = {
  idKeys: Record<string, string>;
  tokens: Array<Record<string, RosenChainToken>>;
};

export type RosenChainToken = {
  [key: string]: any;
  name: string;
  decimals: number;
  metaData: ChainTokenMetadata;
};

export type ChainTokenMetadata = {
  type: string;
  residency: string;
};

export type RosenAmount = {
  amount: bigint;
  decimals: number;
};
