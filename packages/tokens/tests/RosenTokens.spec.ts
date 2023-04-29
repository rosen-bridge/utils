import firstSample from './samples/firstSample.json';
import secondSample from './samples/secondSample.json';
import { RosenTokens } from '../lib';
import { TokenMap } from '../lib';

const firstToken = {
  ergo: {
    tokenID: '1111111111111111111111111111111111111111111111111111111111111111',
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
};

const secondToken = {
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
};

describe('TokenMap', () => {
  describe('search', () => {
    it('should return asset with condition on the policyID and assetID', () => {
      const map: RosenTokens = firstSample;
      const tokenMap = new TokenMap(map);
      const res = tokenMap.search('cardano', {
        policyID: '22222222222222222222222222222222222222222222222222222222',
        assetID:
          '3333333333333333333333333333333333333333333333333333333333333333333333333333',
      });
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(firstToken);
    });

    it('returns asset with specific ergo tokenID', () => {
      const map: RosenTokens = firstSample;
      const tokenMap = new TokenMap(map);
      const res = tokenMap.search('ergo', {
        tokenID: 'tokenId',
      });
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(secondToken);
    });

    it('should return empty array in case of wrong chain', () => {
      const map: RosenTokens = firstSample;
      const tokenMap = new TokenMap(map);
      const res = tokenMap.search('bitcoin', {
        tokenID: 'tokenId',
      });
      expect(res.length).toEqual(0);
    });
  });
  describe('getID', () => {
    it('should return ergo tokenId of tha passed token', () => {
      const map: RosenTokens = firstSample;
      const tokenMap = new TokenMap(map);
      const res = tokenMap.getID(firstToken, 'ergo');
      expect(res).toEqual(firstToken.ergo.tokenID);
    });

    it('should return cardano fingerprint of tha passed token', () => {
      const map: RosenTokens = firstSample;
      const tokenMap = new TokenMap(map);
      const res = tokenMap.getID(secondToken, 'cardano');
      expect(res).toEqual(secondToken.cardano.fingerprint);
    });

    it('tests that if idKeys is missed in the config throws error', () => {
      const map: RosenTokens = secondSample;
      const tokenMap = new TokenMap(map);
      expect(() => tokenMap.getID(secondToken, 'ergo')).toThrow(
        `idKey of the ergo chain is missed in the config file`
      );
    });
  });
  describe('getIdKey', () => {
    it('should return `tokenId`for ergo chain', function () {
      const map: RosenTokens = firstSample;
      const tokenMap = new TokenMap(map);
      expect(tokenMap.getIdKey('ergo')).toEqual('tokenID');
    });

    it('should throw exception for unknown chain', function () {
      const map: RosenTokens = firstSample;
      const tokenMap = new TokenMap(map);
      expect(() => tokenMap.getIdKey('btc')).toThrow();
    });
  });
});
