export type RosenTokens = Array<
  Record<string, RosenChainToken & Record<string, any>>
>;

export interface RosenChainToken {
  tokenId: string;
  name: string;
  decimals: number;
  type: string;
  residency: string;
}

export interface CardanoChainToken extends RosenChainToken {
  policyId: string;
  assetName: string;
}

export interface RosenAmount {
  amount: bigint;
  decimals: number;
}
