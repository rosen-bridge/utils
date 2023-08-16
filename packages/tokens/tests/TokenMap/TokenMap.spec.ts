import { RosenTokens } from '../../lib';
import { TokenMap } from '../../lib';
import { firstTokenMap, secondTokenMap } from './TokenMapTestData';

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
    /**
     * @target TokenMap.search should return asset with condition on the policyID and assetID
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call search with specific policyID and assetID
     * @expected
     * - must return one token
     * - returned token must equal to specified token
     */
    it('should return asset with condition on the policyID and assetID', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.search('cardano', {
        policyID: '22222222222222222222222222222222222222222222222222222222',
        assetID:
          '3333333333333333333333333333333333333333333333333333333333333333333333333333',
      });
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(firstToken);
    });

    /**
     * @target TokenMap.search should return asset with specific ergo tokenID
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call search with specific tokenID
     * @expected
     * - must return one token
     * - returned token must equal to specified token
     */
    it('should return asset with specific ergo tokenID', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.search('ergo', {
        tokenID: 'tokenId',
      });
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(secondToken);
    });

    /**
     * @target TokenMap.search should return empty array in case of wrong chain
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call search with wrong chain name
     * @expected
     * - must return empty list
     */
    it('should return empty array in case of wrong chain', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.search('bitcoin', {
        tokenID: 'tokenId',
      });
      expect(res.length).toEqual(0);
    });
  });

  describe('getID', () => {
    /**
     * @target TokenMap.getID should return ergo tokenId of tha passed token
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getId for ergo chain
     * @expected
     * - return tokenId for ergoChain in specified token
     */
    it('should return ergo tokenId of tha passed token', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.getID(firstToken, 'ergo');
      expect(res).toEqual(firstToken.ergo.tokenID);
    });

    /**
     * @target TokenMap.getID should return cardano fingerprint of tha passed token
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getId for ergo chain
     * @expected
     * - return fingerprint for cardanoChain in specified token
     */
    it('should return cardano fingerprint of tha passed token', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.getID(secondToken, 'cardano');
      expect(res).toEqual(secondToken.cardano.fingerprint);
    });

    /**
     * @target TokenMap.getID should return cardano fingerprint of tha passed token
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getId for ergo chain in wrong token
     * @expected
     * - must throw exception
     */
    it('tests that if idKeys is missed in the config throws error', () => {
      const tokenMap = new TokenMap(secondTokenMap);
      expect(() => tokenMap.getID(secondToken, 'ergo')).toThrow();
    });
  });

  describe('getIdKey', () => {
    /**
     * @target TokenMap.getID should return `tokenId`for ergo chain
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getIdKey for ergo chain
     * @expected
     * - must return 'tokenID'
     */
    it('should return `tokenId`for ergo chain', function () {
      const tokenMap = new TokenMap(firstTokenMap);
      expect(tokenMap.getIdKey('ergo')).toEqual('tokenID');
    });

    /**
     * @target TokenMap.getID should throw exception for unknown chain
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getIdKey for btc chain
     * @expected
     * - must throw exception
     */
    it('should throw exception for unknown chain', function () {
      const tokenMap = new TokenMap(firstTokenMap);
      expect(() => tokenMap.getIdKey('btc')).toThrow();
    });
  });

  describe('getTokens', () => {
    /**
     * @target TokenMap.getTokens should return one ergo token from ergo to binance
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getTokens from ergo to binance
     * @expected
     * - must return one token with specified data
     */
    it('should return one ergo token from ergo to binance', function () {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.getTokens('ergo', 'binance');
      expect(res).toEqual([firstTokenMap.tokens[1].ergo]);
    });

    /**
     * @target TokenMap.getTokens should return empty list when target chain not supported
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getTokens from ergo to btc
     * @expected
     * - must return empty list
     */
    it('should return one ergo token from ergo to binance', function () {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.getTokens('ergo', 'btc');
      expect(res.length).toEqual(0);
    });

    /**
     * @target TokenMap.getTokens should return empty list when transfer token between chains not feasible
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getTokens from cardano to binance
     * @expected
     * - must return empty list
     */
    it('should return one ergo token from ergo to binance', function () {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.getTokens('cardano', 'binance');
      expect(res.length).toEqual(0);
    });
  });
});
