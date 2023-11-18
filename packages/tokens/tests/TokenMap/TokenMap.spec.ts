import { RosenTokens } from '../../lib';
import { TokenMap } from '../../lib';
import {
  firstToken,
  firstTokenMap,
  secondToken,
  secondTokenMap,
} from './TokenMapTestData';

describe('TokenMap', () => {
  describe('search', () => {
    /**
     * @target TokenMap.search should return asset with condition on the policyId and assetName
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call search with specific policyId and assetName
     * @expected
     * - must return one token
     * - returned token must equal to specified token
     */
    it('should return asset with condition on the policyId and assetName', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.search('cardano', {
        policyId: 'policyId2',
        assetName: 'assetName2',
      });
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(firstToken);
    });

    /**
     * @target TokenMap.search should return asset with specific ergo tokenId
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call search with specific tokenId
     * @expected
     * - must return one token
     * - returned token must equal to specified token
     */
    it('should return asset with specific ergo tokenId', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.search('ergo', {
        tokenId: 'tokenId',
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
        tokenId: 'tokenId',
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
      expect(res).toEqual(firstToken.ergo.tokenId);
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
      expect(res).toEqual(secondToken.cardano.tokenId);
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
     * - must return 'tokenId'
     */
    it('should return `tokenId`for ergo chain', function () {
      const tokenMap = new TokenMap(firstTokenMap);
      expect(tokenMap.getIdKey('ergo')).toEqual('tokenId');
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
    it('should return one ergo token from ergo to binance', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.getTokens('ergo', 'binance');
      expect(res).toEqual([firstTokenMap.tokens[1].ergo]);
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
    it('should return empty list when transfer token between chains not feasible', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      const res = tokenMap.getTokens('cardano', 'binance');
      expect(res.length).toEqual(0);
    });
  });

  describe('getAllChains', () => {
    /**
     * @target TokenMap.getAllChains should return all supported chains
     * @dependencies
     * @scenario
     * - call getAllChains
     * @expected
     * - should return list of three supported network ['binance', 'cardano', 'ergo']
     */
    it('should return all supported chains', () => {
      const tokenMap = new TokenMap(firstTokenMap);
      expect(tokenMap.getAllChains().sort()).toEqual([
        'binance',
        'cardano',
        'ergo',
      ]);
    });
  });

  describe('getSupportedChains', () => {
    const tokenMap: TokenMap = new TokenMap(firstTokenMap);

    /**
     * @target TokenMap.getSupportedChains should not return source chain
     * @dependencies
     * @scenario
     * - call getSupportedChains for ergo chain
     * @expect
     * - returned list must not contain ergo
     */
    it('should not return source chain', () => {
      expect(tokenMap.getSupportedChains('ergo')).not.toContain('ergo');
    });

    /**
     * @target TokenMap.getSupportedChains should not return unsupported chains for specific chain
     * @dependencies
     * @scenario
     * - call getSupportedChains for binance chain
     * @expect
     * - returned list must not contain cardano
     */
    it('should not return unsupported chains for specific chain', () => {
      expect(tokenMap.getSupportedChains('binance')).not.toContain('cardano');
    });

    /**
     * @target TokenMap.getSupportedChains should return all supported chain for specific chain
     * @dependencies
     * @scenario
     * - call getSupportedChains for ergo chain
     * @expect
     * - returned list must equal to ['binance', 'cardano']
     */
    it('should return all supported chain for specific chain', () => {
      expect(tokenMap.getSupportedChains('ergo').sort()).toEqual([
        'binance',
        'cardano',
      ]);
    });
  });
});
