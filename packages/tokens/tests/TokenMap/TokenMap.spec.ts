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
} from './TokenMapTestData';

describe('TokenMap', () => {
  describe('updateConfigByBoxes', () => {
    /**
     * @target TokenMap.updateConfigByBoxes should successfully extract config from given boxes
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test
     * - check returned value
     * @expected
     * - it should return expected config
     */
    it('should successfully extract config from given boxes', () => {
      const tokenMap = new TokenMap();
      const serializedBoxes = Object.values(configBoxes).map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes()
        ).toString('hex')
      );

      tokenMap.updateConfigByBoxes(serializedBoxes);
      const res = tokenMap.getConfig();
      expect(res).toEqual(thirdTokenMap);
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when one of the required fields is missing in the headers
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     */
    it('should throw CorruptedConfigError when one of the required fields is missing in the headers', () => {
      const tokenMap = new TokenMap();
      const serializedBox = Buffer.from(
        ErgoBox.from_json(missingHeaderFieldConfigBox).sigma_serialize_bytes()
      ).toString('hex');

      expect(() => {
        tokenMap.updateConfigByBoxes([serializedBox]);
      }).toThrow(CorruptedConfigError);
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when `ergoSideTokenId` is in wrong index in the headers
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     */
    it('should throw CorruptedConfigError when `ergoSideTokenId` is in wrong index in the headers', () => {
      const tokenMap = new TokenMap();
      const serializedBox = Buffer.from(
        ErgoBox.from_json(wrongFieldIndexConfigBox).sigma_serialize_bytes()
      ).toString('hex');

      expect(() => {
        tokenMap.updateConfigByBoxes([serializedBox]);
      }).toThrow(CorruptedConfigError);
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when headers and data length are inconsistent in Ergo config
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     */
    it('should throw CorruptedConfigError when headers and data length are inconsistent in Ergo config', () => {
      const tokenMap = new TokenMap();
      const serializedBox = Buffer.from(
        ErgoBox.from_json(inconsistentDataErgoConfigBox).sigma_serialize_bytes()
      ).toString('hex');

      expect(() => {
        tokenMap.updateConfigByBoxes([serializedBox]);
      }).toThrow(CorruptedConfigError);
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when duplicate ergo token is found in multiple boxes
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     */
    it('should throw CorruptedConfigError when duplicate ergo token is found in multiple boxes', () => {
      const tokenMap = new TokenMap();
      const serializedBoxes = [
        sampleErgoConfigBoxForDuplication,
        configBoxes.ergo0,
      ].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes()
        ).toString('hex')
      );

      expect(() => {
        tokenMap.updateConfigByBoxes(serializedBoxes);
      }).toThrow(CorruptedConfigError);
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when duplicate ergo token is found in single box
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     */
    it('should throw CorruptedConfigError when duplicate ergo token is found in single box', () => {
      const tokenMap = new TokenMap();
      const serializedBoxes = [duplicateTokenConfigBox].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes()
        ).toString('hex')
      );

      expect(() => {
        tokenMap.updateConfigByBoxes(serializedBoxes);
      }).toThrow(CorruptedConfigError);
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when headers and data length are inconsistent in non-Ergo config
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     */
    it('should throw CorruptedConfigError when headers and data length are inconsistent in non-Ergo config', () => {
      const tokenMap = new TokenMap();
      const serializedBoxes = [
        inconsistentDataCardanoConfigBox,
        configBoxes.ergo0,
      ].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes()
        ).toString('hex')
      );

      expect(() => {
        tokenMap.updateConfigByBoxes(serializedBoxes);
      }).toThrow(CorruptedConfigError);
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when ergo side token is not found
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     */
    it('should throw CorruptedConfigError when ergo side token is not found', () => {
      const tokenMap = new TokenMap();
      const serializedBoxes = [
        configBoxes.ergo0,
        configBoxes.cardano,
        configBoxes.bitcoin,
      ].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes()
        ).toString('hex')
      );

      expect(() => {
        tokenMap.updateConfigByBoxes(serializedBoxes);
      }).toThrow(CorruptedConfigError);
    });

    /**
     * @target TokenMap.updateConfigByBoxes should throw CorruptedConfigError
     * when duplicate token for single ergo token is found
     * @dependencies
     * @scenario
     * - mock config boxes
     * - run test & check thrown exception
     * @expected
     * - CorruptedConfigError should be thrown
     */
    it('should throw CorruptedConfigError when duplicate token for single ergo token is found', () => {
      const tokenMap = new TokenMap();
      const serializedBoxes = [
        configBoxes.ergo0,
        configBoxes.cardano,
        sampleConfigBoxForDuplication,
        configBoxes.bitcoin,
      ].map((boxJson) =>
        Buffer.from(
          ErgoBox.from_json(boxJson).sigma_serialize_bytes()
        ).toString('hex')
      );

      expect(() => {
        tokenMap.updateConfigByBoxes(serializedBoxes);
      }).toThrow(CorruptedConfigError);
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
    it('should return asset with condition on the policyId and assetName', () => {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
      const res = tokenMap.getID(firstToken, 'ergo');
      expect(res).toEqual(firstToken.ergo.tokenId);
    });
  });

  describe('getIdKey', () => {
    /**
     * @target TokenMap.getID should return `tokenId` for ergo chain
     * @dependencies
     * - RosenToken json
     * @scenario
     * - call getIdKey for ergo chain
     * @expected
     * - must return 'tokenId'
     */
    it('should return `tokenId`for ergo chain', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
      expect(tokenMap.getIdKey('ergo')).toEqual('tokenId');
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
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
    it('should return empty list when transfer token between chains not feasible', () => {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
      expect(tokenMap.getAllChains().sort()).toEqual([
        'binance',
        'cardano',
        'ergo',
      ]);
    });
  });

  describe('getSupportedChains', () => {
    const tokenMap: TokenMap = new TokenMap();
    tokenMap.updateConfigByJson(firstTokenMap);

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
    it('should return all cardano native tokens', () => {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
    it('should return all ergo native tokens', () => {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
    it('should return token set successfully', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
    it('should return undefined when token is not found', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(firstTokenMap);
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
    it('should drop decimals successfully', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.wrapAmount(
        'policyId3.assetName3',
        123456789n,
        'cardano'
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
    it('should drop decimals without rounding successfully', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.wrapAmount(
        'policyId3.assetName3',
        123400000n,
        'cardano'
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
    it('should keep amount when it is already with significant decimals', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
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
    it('should keep amount when token is not supported', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
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
    it('should add decimals successfully', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.unwrapAmount(
        'policyId3.assetName3',
        1234n,
        'cardano'
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
    it('should keep amount when it is already with significant decimals', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
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
    it('should keep amount when token is not supported', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
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
    it('should return significant decimals successfully', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
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
    it('should keep amount when token is not supported', function () {
      const tokenMap = new TokenMap();
      tokenMap.updateConfigByJson(multiDecimalTokenMap);
      const result = tokenMap.getSignificantDecimals('not.supported');
      expect(result).toBeUndefined();
    });
  });
});
