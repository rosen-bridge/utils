import { RosenTokens } from '../../lib';

export const firstTokenMap: RosenTokens = {
  idKeys: {
    ergo: 'tokenID',
    cardano: 'fingerprint',
  },
  tokens: [
    {
      ergo: {
        tokenID:
          '1111111111111111111111111111111111111111111111111111111111111111',
        name: 'test token1',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
      cardano: {
        fingerprint: 'asset111111111111111111111111111111111111111',
        policyID: '22222222222222222222222222222222222222222222222222222222',
        assetID:
          '3333333333333333333333333333333333333333333333333333333333333333333333333333',
        name: 'asset1',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
    },
    {
      ergo: {
        tokenID:
          '2222222222222222222222222222222222222222222222222222222222222222',
        name: 'test token2',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
      binance: {
        id: 'this is a simple ip',
        name: 'binanceAsset',
        decimals: 0,
        metaData: {
          type: 'BNBToken',
          residency: 'tokenResidency',
        },
      },
    },
    {
      ergo: {
        tokenID: 'tokenId',
        name: 'test token3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
      cardano: {
        fingerprint: 'asset3fingerprint',
        policyID: 'policyID3',
        assetID: 'assetID3',
        name: 'asset3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
    },
  ],
};

export const secondTokenMap: RosenTokens = {
  idKeys: {
    cardano: 'fingerprint',
  },
  tokens: [
    {
      ergo: {
        tokenID: 'tokenId',
        name: 'test token3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
      cardano: {
        fingerprint: 'asset3fingerprint',
        policyID: 'policyID3',
        assetID: 'assetID3',
        name: 'asset3',
        decimals: 0,
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
    },
  ],
};

export const firstToken = {
  ergo: {
    tokenID: '1111111111111111111111111111111111111111111111111111111111111111',
    name: 'test token1',
    decimals: 0,
    metaData: {
      type: 'tokenType',
      residency: 'tokenResidency',
    },
  },
  cardano: {
    fingerprint: 'asset111111111111111111111111111111111111111',
    policyID: '22222222222222222222222222222222222222222222222222222222',
    assetID:
      '3333333333333333333333333333333333333333333333333333333333333333333333333333',
    name: 'asset1',
    decimals: 0,
    metaData: {
      type: 'tokenType',
      residency: 'tokenResidency',
    },
  },
};

export const secondToken = {
  ergo: {
    tokenID: 'tokenId',
    name: 'test token3',
    decimals: 0,
    metaData: {
      type: 'tokenType',
      residency: 'tokenResidency',
    },
  },
  cardano: {
    fingerprint: 'asset3fingerprint',
    policyID: 'policyID3',
    assetID: 'assetID3',
    name: 'asset3',
    decimals: 0,
    metaData: {
      type: 'tokenType',
      residency: 'tokenResidency',
    },
  },
};
