import { RosenTokens } from '../../lib';

export const firstTokenMap: RosenTokens = {
  idKeys: {
    ergo: 'tokenId',
    cardano: 'tokenId',
  },
  tokens: [
    {
      ergo: {
        tokenId:
          '1111111111111111111111111111111111111111111111111111111111111111',
        name: 'test token1',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'native',
        },
      },
      cardano: {
        tokenId: 'policyId2.assetName2',
        policyId: 'policyId2',
        assetName: 'assetName2',
        name: 'asset1',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'wrapped',
        },
      },
    },
    {
      ergo: {
        tokenId:
          '2222222222222222222222222222222222222222222222222222222222222222',
        name: 'test token2',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'native',
        },
      },
      binance: {
        id: 'this is a simple ip',
        name: 'binanceAsset',
        decimals: 0,
        metaData: {
          type: 'BNBToken',
          residency: 'wrapped',
        },
      },
    },
    {
      ergo: {
        tokenId: 'tokenId',
        name: 'test token3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'wrapped',
        },
      },
      cardano: {
        tokenId: 'policyId3.assetName3',
        policyId: 'policyId3',
        assetName: 'assetName3',
        name: 'asset3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'native',
        },
      },
    },
  ],
};

export const secondTokenMap: RosenTokens = {
  idKeys: {
    cardano: 'tokenId',
  },
  tokens: [
    {
      ergo: {
        tokenId: 'tokenId',
        name: 'test token3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'native',
        },
      },
      cardano: {
        tokenId: 'policyId3.assetName3',
        policyId: 'policyId3',
        assetName: 'assetName3',
        name: 'asset3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'wrapped',
        },
      },
    },
  ],
};

export const firstToken = {
  ergo: {
    tokenId: '1111111111111111111111111111111111111111111111111111111111111111',
    name: 'test token1',
    decimals: 0,
    metaData: {
      type: 'tokenType',
      residency: 'native',
    },
  },
  cardano: {
    tokenId: 'policyId2.assetName2',
    policyId: 'policyId2',
    assetName: 'assetName2',
    name: 'asset1',
    decimals: 0,
    metaData: {
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
};

export const secondToken = {
  ergo: {
    tokenId: 'tokenId',
    name: 'test token3',
    decimals: 0,
    metaData: {
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
  cardano: {
    tokenId: 'policyId3.assetName3',
    policyId: 'policyId3',
    assetName: 'assetName3',
    name: 'asset3',
    decimals: 0,
    metaData: {
      type: 'tokenType',
      residency: 'native',
    },
  },
};
