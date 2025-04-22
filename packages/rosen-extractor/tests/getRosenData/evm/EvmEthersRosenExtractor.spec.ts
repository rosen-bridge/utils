import { EvmEthersRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../TestUtils';
import { JsonRpcProvider, TransactionResponse } from 'ethers';
import { TokenMap } from '@rosen-bridge/tokens';

describe('EvmEthersRosenExtractor', () => {
  describe('constructor', () => {
    const tokenMap = new TokenMap();

    /**
     * @target `EvmEthersRosenExtractor.constructor` should register a callback on TokenMap that updates supported tokens list whenever TokenMap is updated
     * @dependencies
     * @scenario
     * - initialize extractor
     * - update token map with new tokens
     * - check supported tokens list
     * @expected
     * - supported tokens list should be updated with new tokens
     */
    it('should register a callback on TokenMap that updates supported tokens list whenever TokenMap is updated', async () => {
      const chainName = 'ethereum';
      const nativeToken = 'eth';
      const extractor = new EvmEthersRosenExtractor(
        testData.lockAddress,
        tokenMap,
        chainName,
        nativeToken
      );

      await tokenMap.updateConfigByJson(TestUtils.tokens);

      const expectedTokens = TestUtils.tokens
        .filter((tokenSet) => Object.hasOwn(tokenSet, chainName))
        .map((tokenSet) => tokenSet[chainName].tokenId);

      expect((extractor as any).supportedTokens).toEqual(expectedTokens);
    });
  });

  describe('get', () => {
    const chainName = 'ethereum';
    const nativeToken = 'eth';
    const tokenMap = new TokenMap();
    const extractor = new EvmEthersRosenExtractor(
      testData.lockAddress,
      tokenMap,
      chainName,
      nativeToken
    );
    const rpcExtractorMock = jest.spyOn(
      (extractor as any).rpcExtractor,
      'extractRawData'
    );

    beforeAll(async () => {
      await tokenMap.updateConfigByJson(TestUtils.tokens);
    });

    beforeEach(() => {
      rpcExtractorMock.mockReset();
    });

    /**
     * @target `EvmEthersRosenExtractor.get` should extract rosenData from
     * EVM locking native-asset transfer tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     * - extractRawData of rpcExtractor should be called
     */
    it('should extract rosenData from EVM locking native-asset transfer tx successfully', () => {
      const validLockTx = testData.validNativeLockTx;
      const result = extractor.get(
        new TransactionResponse(validLockTx as any, new JsonRpcProvider())
      );

      expect(result).toStrictEqual(testData.rosenDataNative);
      expect(rpcExtractorMock).toHaveBeenCalled();
    });

    /**
     * @target `EvmEthersRosenExtractor.get` should return undefined when
     * recipient is a supported token but call data does not start with `transfer` signature
     * @dependencies
     * @scenario
     * - mock extractor with no ERC-20 nor eth transfer
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     * - extractRawData of rpcExtractor should be called
     */
    it('should return undefined when recipient is a supported token but call data does not start with `transfer` signature', () => {
      const invalidTx = testData.noLockNoTransfer;
      const result = extractor.get(
        new TransactionResponse(invalidTx as any, new JsonRpcProvider())
      );

      expect(result).toBeUndefined();
      expect(rpcExtractorMock).toHaveBeenCalled();
    });

    /**
     * @target `EvmEthersRosenExtractor.get` should return undefined when to is not lock address nor supported token
     * @dependencies
     * @scenario
     * - mock transaction with to address not in supported tokens
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     * - extractRawData of rpcExtractor should not be called
     */
    it('should return undefined when to is not lock address nor supported token', () => {
      const invalidTx = testData.invalidLockTxUnsupportedToken;
      const result = extractor.get(
        new TransactionResponse(invalidTx as any, new JsonRpcProvider())
      );

      expect(result).toBeUndefined();
      expect(rpcExtractorMock).not.toHaveBeenCalled();
    });
  });
});
