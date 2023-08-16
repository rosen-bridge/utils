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
        tokenName: 'test token1',
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
        tokenName: 'test token2',
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
      binance: {
        id: 'this is a simple ip',
        metaData: {
          type: 'BNBToken',
          residency: 'tokenResidency',
        },
      },
    },
    {
      ergo: {
        tokenID: 'tokenId',
        tokenName: 'test token3',
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
      cardano: {
        fingerprint: 'asset3fingerprint',
        policyID: 'policyID3',
        assetID: 'assetID3',
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
        tokenName: 'test token3',
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
      cardano: {
        fingerprint: 'asset3fingerprint',
        policyID: 'policyID3',
        assetID: 'assetID3',
        metaData: {
          type: 'tokenType',
          residency: 'tokenResidency',
        },
      },
    },
  ],
};
