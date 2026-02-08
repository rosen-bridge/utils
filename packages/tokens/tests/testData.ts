import { RosenChainToken, RosenTokens } from '../lib';

export const firstTokenMap: RosenTokens = [
  {
    ergo: {
      tokenId:
        '1111111111111111111111111111111111111111111111111111111111111111',
      name: 'test token1',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
      extra: {},
    },
    cardano: {
      tokenId: 'policyId2.assetName2',
      extra: {
        policyId: 'policyId2',
        assetName: 'assetName2',
      },
      name: 'asset1',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
  {
    ergo: {
      tokenId:
        '2222222222222222222222222222222222222222222222222222222222222222',
      name: 'test token2',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
      extra: {},
    },
    binance: {
      tokenId: 'this is a simple ip',
      name: 'binanceAsset',
      decimals: 0,
      type: 'BNBToken',
      residency: 'wrapped',
      extra: {},
    },
  },
  {
    ergo: {
      tokenId: 'tokenId',
      name: 'test token3',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
      extra: {},
    },
    cardano: {
      tokenId: 'policyId3.assetName3',
      extra: {
        policyId: 'policyId3',
        assetName: 'assetName3',
      },
      name: 'asset3',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
  },
];

export const multiDecimalTokenMap: RosenTokens = [
  {
    ergo: {
      tokenId: 'tokenId',
      name: 'test token3',
      decimals: 3,
      type: 'tokenType',
      residency: 'native',
      extra: {},
    },
    cardano: {
      tokenId: 'policyId3.assetName3',
      extra: {
        policyId: 'policyId3',
        assetName: 'assetName3',
      },
      name: 'asset3',
      decimals: 8,
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
];

export const unbridgeableTokens: RosenTokens = [
  {
    base: {
      tokenId: 'eth-base',
      name: 'ETH (BASE)',
      decimals: 18,
      type: 'native',
      residency: 'native',
      extra: {},
    },
  },
  {
    chainX: {
      tokenId: 'random-token',
      name: 'Random Token',
      decimals: 6,
      type: 'tokenType',
      residency: 'native',
      extra: {
        uniqueField: 'uniqueValue',
      },
    },
  },
];
export const firstTokenMapWithUnbridgeableTokens: RosenTokens = [
  unbridgeableTokens[0],
  ...firstTokenMap,
  ...unbridgeableTokens.slice(1),
];

export const firstToken: Record<string, RosenChainToken> = {
  ergo: {
    tokenId: '1111111111111111111111111111111111111111111111111111111111111111',
    name: 'test token1',
    decimals: 0,
    type: 'tokenType',
    residency: 'native',
    extra: {},
  },
  cardano: {
    tokenId: 'policyId2.assetName2',
    extra: {
      policyId: 'policyId2',
      assetName: 'assetName2',
    },
    name: 'asset1',
    decimals: 0,
    type: 'tokenType',
    residency: 'wrapped',
  },
};

export const secondToken: Record<string, RosenChainToken> = {
  ergo: {
    tokenId: 'tokenId',
    name: 'test token3',
    decimals: 0,
    type: 'tokenType',
    residency: 'wrapped',
    extra: {},
  },
  cardano: {
    tokenId: 'policyId3.assetName3',
    extra: {
      policyId: 'policyId3',
      assetName: 'assetName3',
    },
    name: 'asset3',
    decimals: 0,
    type: 'tokenType',
    residency: 'native',
  },
};

export const invalidTokenSet: Record<string, RosenChainToken> = {
  cardano: {
    tokenId: 'policyId4.assetName4',
    extra: {
      policyId: 'policyId4',
      assetName: 'assetName4',
    },
    name: 'asset4',
    decimals: 0,
    type: 'tokenType',
    residency: 'native',
  },
  chainX: {
    tokenId: 'chainX-token',
    extra: {
      uniqueField: 'uniqueValue',
    },
    name: 'chainX Token',
    decimals: 0,
    type: 'tokenType',
    residency: 'wrapped',
  },
};
