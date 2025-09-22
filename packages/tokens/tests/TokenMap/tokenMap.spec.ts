import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { CorruptedConfigError, TokenMap } from '../../lib';
import {
  configBoxes,
  duplicateTokenConfigBox,
  firstToken,
  firstTokenMap,
  inconsistentDataCardanoConfigBox,
  inconsistentDataErgoConfigBox,
  missingHeaderFieldConfigBox,
  multiDecimalTokenMap,
  sampleConfigBoxForDuplication,
  sampleErgoConfigBoxForDuplication,
  secondToken,
  thirdTokenMap,
  wrongFieldIndexConfigBox,
} from './tokenMapTestData';

describe('TokenMap', () => {
  describe('updateConfigByBoxes', () => {
    /**
     * @target TokenMap.updateConfigByBoxes should successfully extract config from given boxes
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test
     * - check returned value and callback
     * @expected
     * - it should return expected config
     * - mocked callback should got called
     */
    it('should successfully extract config from given boxes', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBoxes = Object.values(configBoxes).map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes(),
        ).toString('hex'),
      );

      await tokenMap.updateConfigByBoxes(serializedBoxes);
      const res = tokenMap.getConfig();
      expect(res).toEqual(thirdTokenMap);
      expect(mockedCallback).toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when one of the required fields is missing in the headers
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when one of the required fields is missing in the headers', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBox = Buffer.from(
        ErgoBox.from_json(missingHeaderFieldConfigBox).sigma_serialize_bytes(),
      ).toString('hex');

      await expect(async () => {
        await tokenMap.updateConfigByBoxes([serializedBox]);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when `ergoSideTokenId` is in wrong index in the headers
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when `ergoSideTokenId` is in wrong index in the headers', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBox = Buffer.from(
        ErgoBox.from_json(wrongFieldIndexConfigBox).sigma_serialize_bytes(),
      ).toString('hex');

      await expect(async () => {
        await tokenMap.updateConfigByBoxes([serializedBox]);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when headers and data length are inconsistent in Ergo config
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when headers and data length are inconsistent in Ergo config', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBox = Buffer.from(
        ErgoBox.from_json(
          inconsistentDataErgoConfigBox,
        ).sigma_serialize_bytes(),
      ).toString('hex');

      await expect(async () => {
        await tokenMap.updateConfigByBoxes([serializedBox]);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when duplicate ergo token is found in multiple boxes
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when duplicate ergo token is found in multiple boxes', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBoxes = [
        sampleErgoConfigBoxForDuplication,
        configBoxes.ergo0,
      ].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes(),
        ).toString('hex'),
      );

      await expect(async () => {
        await tokenMap.updateConfigByBoxes(serializedBoxes);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when duplicate ergo token is found in single box
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when duplicate ergo token is found in single box', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBoxes = [duplicateTokenConfigBox].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes(),
        ).toString('hex'),
      );

      await expect(async () => {
        await tokenMap.updateConfigByBoxes(serializedBoxes);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when headers and data length are inconsistent in non-Ergo config
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when headers and data length are inconsistent in non-Ergo config', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBoxes = [
        inconsistentDataCardanoConfigBox,
        configBoxes.ergo0,
      ].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes(),
        ).toString('hex'),
      );

      await expect(async () => {
        await tokenMap.updateConfigByBoxes(serializedBoxes);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when ergo side token is not found
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when ergo side token is not found', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBoxes = [
        configBoxes.ergo0,
        configBoxes.cardano,
        configBoxes.bitcoin,
      ].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes(),
        ).toString('hex'),
      );

      await expect(async () => {
        await tokenMap.updateConfigByBoxes(serializedBoxes);
      }).rejects.toThrow(CorruptedConfigError);
      expect(mockedCallback).not.toHaveBeenCalled();
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when duplicate token for single ergo token is found
     * @dependencies
     * @scenario
     * - mock config boxes
     * - register a callback
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     * - mocked callback should not got called
     */
    it('should throw CorruptedConfigError when duplicate token for single ergo token is found', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      const serializedBoxes = [
        configBoxes.ergo0,
        configBoxes.cardano,
        sampleConfigBoxForDuplication,
        configBoxes.bitcoin,
      ].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes(),
        ).toString('hex'),
      );

      await expect(async () => {
        await tokenMap.updateConfigByBoxes(serializedBoxes);
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

  describe('updateConfigByJson', () => {
    /**
     * @target TokenMap.updateConfigByJson should update config and trigger callbacks
     * @dependencies
     * @scenario
     * - create a TokenMap instance
     * - register a callback
     * - update config
     * @expected
     * - config should be updated
     * - callback should be triggered
     */
    it('should update config and trigger callbacks', async () => {
      const tokenMap = new TokenMap();
      const mockedCallback = vi.fn();
      mockedCallback.mockResolvedValue(undefined);
      tokenMap.registerCallback(mockedCallback);

      await tokenMap.updateConfigByJson(firstTokenMap);

      expect(tokenMap.getConfig()).toEqual(firstTokenMap);
      expect(mockedCallback).toHaveBeenCalled();
    });
  });
});
