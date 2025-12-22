import { CorruptedConfigError, TokenMap } from '../lib';
import {
  firstToken,
  firstTokenMap,
  firstTokenMapWithUnbridgeableTokens,
  invalidTokenSet,
  multiDecimalTokenMap,
  secondToken,
  unbridgeableTokens,
} from './testData';

describe('TokenMap', () => {
  describe('updateConfigByJson', () => {
    /**
     * @target TokenMap.updateConfigByJson should store bridgeable and unbridgeable tokens separately
     * @dependencies
     * - RosenToken json
     * @scenario
     * - register a callback
     * - call updateConfigByJson
     * - check tokenMap config
     * - check if function got called
     * @expected
     * - the config should contain only bridgeable tokens
     * - the raw config should contain both bridgeable and unbridgeable tokens
     * - mocked callback should got called
     */
    it('should store bridgeable and unbridgeable tokens separately', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      await tokenMap.updateConfigByJson(firstTokenMapWithUnbridgeableTokens);
      const tokenConfig = tokenMap.getConfig();
      expect(tokenConfig).toEqual(firstTokenMap);
      const rawConfig = tokenMap.getRawConfig();
      expect(rawConfig).toEqual([...firstTokenMap, ...unbridgeableTokens]);

      expect(mockedCallback).toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByJson should throw error when a bridgeable token without supporting Ergo is found
     * @dependencies
     * - RosenToken json
     * @scenario
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw error when a bridgeable token without supporting Ergo is found', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      await expect(async () => {
        await tokenMap.updateConfigByJson([
          ...firstTokenMapWithUnbridgeableTokens,
          invalidTokenSet,
        ]);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });
  });

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
    it('should return asset with condition on the policyId and assetName', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      const res = tokenMap.search('cardano', {
        extra: {
          policyId: 'policyId2',
          assetName: 'assetName2',
        },
      });
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(firstToken);
    });

    /**
     * @target TokenMap.search should return asset with condition on single extra field
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call search with specific policyId
     * @expected
     * - must return one token
     * - returned token must equal to specified token
     */
    it('should return asset with condition on single extra field', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      const res = tokenMap.search('cardano', {
        extra: {
          policyId: 'policyId2',
        },
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
    it('should return asset with specific ergo tokenId', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
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
    it('should return empty array in case of wrong chain', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
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
    it('should return ergo tokenId of tha passed token', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      const res = tokenMap.getID(firstToken, 'ergo');
      expect(res).toEqual(firstToken.ergo.tokenId);
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
    it('should return one ergo token from ergo to binance', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      const res = tokenMap.getTokens('ergo', 'binance');
      expect(res).toEqual([firstTokenMap[1].ergo]);
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
    it('should return empty list when transfer token between chains not feasible', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
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
    it('should return all supported chains', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      expect(tokenMap.getAllChains().sort()).toEqual([
        'binance',
        'cardano',
        'ergo',
      ]);
    });
  });

  describe('getSupportedChains', async () => {
    const tokenMap: TokenMap = new TokenMap();
    await tokenMap.updateConfigByJson(firstTokenMap);

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

  describe('getAllNativeTokens', () => {
    /**
     * @target TokenMap.getAllNativeTokens should return all cardano native tokens
     * @dependencies
     * @scenario
     * - call getAllNativeTokens
     * @expected
     * - should return one token of cardano
     */
    it('should return all cardano native tokens', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      expect(tokenMap.getAllNativeTokens('cardano')).toEqual([
        firstTokenMap[2]['cardano'],
      ]);
    });

    /**
     * @target TokenMap.getAllNativeTokens should return all ergo native tokens
     * @dependencies
     * @scenario
     * - call getAllNativeTokens
     * @expected
     * - should return two token of ergo
     */
    it('should return all ergo native tokens', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      expect(tokenMap.getAllNativeTokens('ergo')).toEqual([
        firstTokenMap[0]['ergo'],
        firstTokenMap[1]['ergo'],
      ]);
    });
  });

  describe('getTokenSet', () => {
    /**
     * @target TokenMap.getTokenSet should return token set successfully
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getTokenSet
     * @expected
     * - should return the token set
     */
    it('should return token set successfully', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      const result = tokenMap.getTokenSet('this is a simple ip');
      expect(result).toEqual(firstTokenMap[1]);
    });

    /**
     * @target TokenMap.getTokenSet should return undefined when token is not found
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getTokenSet
     * @expected
     * - should return undefined
     */
    it('should return undefined when token is not found', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMap);
      const result = tokenMap.getTokenSet('not.found');
      expect(result).toBeUndefined();
    });

    /**
     * @target TokenMap.getTokenSet should return token set if unbridgeable tokens are allowed
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getTokenSet with an unbridgeable token id and including unbridgeable tokens
     * @expected
     * - should return the token set
     */
    it('should return token set if unbridgeable tokens are allowed', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMapWithUnbridgeableTokens);
      const result = tokenMap.getTokenSet('random-token', true);
      expect(result).toEqual(unbridgeableTokens[1]);
    });

    /**
     * @target TokenMap.getTokenSet should return undefined when token is unbridgeable and unbridgeable tokens are not allowed
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getTokenSet with an unbridgeable token id without including unbridgeable tokens
     * @expected
     * - should return undefined
     */
    it('should return undefined when token is unbridgeable and unbridgeable tokens are not allowed', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMapWithUnbridgeableTokens);
      const result = tokenMap.getTokenSet('random-token', false);
      expect(result).toBeUndefined();
    });
  });

  describe('wrapAmount', () => {
    /**
     * @target TokenMap.wrapAmount should drop decimals successfully
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call wrapAmount for cardano chain
     * @expected
     * - should return amount with less digits
     */
    it('should drop decimals successfully', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.wrapAmount(
        'policyId3.assetName3',
        123456789n,
        'cardano',
      );
      expect(result.amount).toEqual(1235n);
      expect(result.decimals).toEqual(3);
    });

    /**
     * @target TokenMap.wrapAmount should drop decimals without rounding successfully
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call wrapAmount for cardano chain
     * @expected
     * - should return amount with less and without rounding
     */
    it('should drop decimals without rounding successfully', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.wrapAmount(
        'policyId3.assetName3',
        123400000n,
        'cardano',
      );
      expect(result.amount).toEqual(1234n);
      expect(result.decimals).toEqual(3);
    });

    /**
     * @target TokenMap.wrapAmount should keep amount when it is already with significant decimals
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call wrapAmount for ergo chain
     * @expected
     * - should return amount with same digits
     */
    it('should keep amount when it is already with significant decimals', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.wrapAmount('tokenId', 123456789n, 'ergo');
      expect(result.amount).toEqual(123456789n);
      expect(result.decimals).toEqual(3);
    });

    /**
     * @target TokenMap.wrapAmount should keep amount when token is not supported
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call wrapAmount for ergo chain
     * @expected
     * - should return amount with same digits and 0 decimals
     */
    it('should keep amount when token is not supported', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.wrapAmount('not.supported', 123456789n, 'ergo');
      expect(result.amount).toEqual(123456789n);
      expect(result.decimals).toEqual(0);
    });

    /**
     * @target TokenMap.wrapAmount should consider unbridgeable tokens
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call wrapAmount for and unbridgeable token
     * @expected
     * - should return amount with same digits and the token decimals
     */
    it('should consider unbridgeable tokens', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMapWithUnbridgeableTokens);
      const result = tokenMap.wrapAmount('random-token', 123456789n, 'chainX');
      expect(result.amount).toEqual(123456789n);
      expect(result.decimals).toEqual(6);
    });
  });

  describe('unwrapAmount', () => {
    /**
     * @target TokenMap.unwrapAmount should add decimals successfully
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call unwrapAmount for cardano chain
     * @expected
     * - should return amount with more digits
     */
    it('should add decimals successfully', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.unwrapAmount(
        'policyId3.assetName3',
        1234n,
        'cardano',
      );
      expect(result.amount).toEqual(123400000n);
      expect(result.decimals).toEqual(8);
    });

    /**
     * @target TokenMap.unwrapAmount should keep amount when it is already with significant decimals
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call unwrapAmount for ergo chain
     * @expected
     * - should return amount with same digits
     */
    it('should keep amount when it is already with significant decimals', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.unwrapAmount('tokenId', 123456789n, 'ergo');
      expect(result.amount).toEqual(123456789n);
      expect(result.decimals).toEqual(3);
    });

    /**
     * @target TokenMap.unwrapAmount should keep amount when token is not supported
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call unwrapAmount for ergo chain
     * @expected
     * - should return amount with same digits and 0 decimals
     */
    it('should keep amount when token is not supported', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.unwrapAmount('not.supported', 123456789n, 'ergo');
      expect(result.amount).toEqual(123456789n);
      expect(result.decimals).toEqual(0);
    });

    /**
     * @target TokenMap.unwrapAmount should consider unbridgeable tokens
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call unwrapAmount for and unbridgeable token
     * @expected
     * - should return amount with same digits and the token decimals
     */
    it('should consider unbridgeable tokens', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(firstTokenMapWithUnbridgeableTokens);
      const result = tokenMap.unwrapAmount(
        'random-token',
        123456789n,
        'chainX',
      );
      expect(result.amount).toEqual(123456789n);
      expect(result.decimals).toEqual(6);
    });
  });

  describe('getSignificantDecimals', () => {
    /**
     * @target TokenMap.getSignificantDecimals should return significant decimals successfully
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getSignificantDecimals for a supported token with multiple decimals
     * @expected
     * - should return the minimum decimals in the token set
     */
    it('should return significant decimals successfully', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.getSignificantDecimals('policyId3.assetName3');
      expect(result).toEqual(3);
    });

    /**
     * @target TokenMap.getSignificantDecimals should keep amount when token is not supported
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getSignificantDecimals for an unsupported token
     * @expected
     * - should return undefined
     */
    it('should keep amount when token is not supported', async function () {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.getSignificantDecimals('not.supported');
      expect(result).toBeUndefined();
    });
  });

  describe('registerCallback', () => {
    /**
     * @target TokenMap.registerCallback should register a new callback successfully
     * @dependencies
     * @scenario
     * - create a TokenMap instance
     * - register a callback
     * - verify callback is called on config update
     * @expected
     * - callback should be called when config is updated
     */
    it('should register a new callback successfully', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);
      await tokenMap.updateConfigByJson(firstTokenMap);

      expect(mockedCallback).toHaveBeenCalled();
    });

    /**
     * @target TokenMap.registerCallback should return incremental IDs
     * @dependencies
     * @scenario
     * - create a TokenMap instance
     * - register multiple callbacks
     * - check callback ids
     * @expected
     * - each callback should get a unique incremental ID
     */
    it('should return incremental IDs', () => {
      const tokenMap = new TokenMap();
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();
      const thirdCallback = vi.fn();

      const firstId = tokenMap.registerCallback(firstCallback);
      const secondId = tokenMap.registerCallback(secondCallback);
      const thirdId = tokenMap.registerCallback(thirdCallback);

      expect(firstId).toBe(0);
      expect(secondId).toBe(1);
      expect(thirdId).toBe(2);
    });
  });

  describe('unregisterCallback', () => {
    /**
     * @target TokenMap.unregisterCallback should remove callback successfully
     * @dependencies
     * @scenario
     * - create a TokenMap instance
     * - register a callback
     * - unregister the callback
     * - verify callback is not called
     * @expected
     * - callback should not be called after unregistering
     */
    it('should remove callback successfully', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);

      const callbackId = tokenMap.registerCallback(mockedCallback);
      tokenMap.unregisterCallback(callbackId);
      await tokenMap.updateConfigByJson(firstTokenMap);

      expect(mockedCallback).not.toHaveBeenCalled();
    });

    /**
     * @target TokenMap.unregisterCallback should handle non-existent callback
     * @dependencies
     * @scenario
     * - create a TokenMap instance
     * - try to unregister non-existent callback
     * @expected
     * - should not throw error
     */
    it('should handle non-existent callback', () => {
      const tokenMap = new TokenMap();
      expect(() => tokenMap.unregisterCallback(999)).not.toThrow();
    });
  });
});
