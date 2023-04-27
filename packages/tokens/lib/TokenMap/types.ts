export type RosenTokens = {
  idKeys: { [key: string]: string };
  tokens: Array<{ [key: string]: RosenChainToken }>;
};

export type RosenChainToken = {
  [key: string]: unknown;
  metaData: ChainTokenMetadata;
};

export type ChainTokenMetadata = {
  type: string;
  residency: string;
};
