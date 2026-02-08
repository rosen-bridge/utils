import { FiroRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../testUtils';
import { ERGO_CHAIN, ETHEREUM_CHAIN } from '../../../lib/getRosenData/const';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap } from '@rosen-bridge/tokens';

describe('FiroRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `FiroRosenExtractor.get` should extract rosenData from
     * FIRO locking tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from FIRO locking tx successfully', () => {
      const validLockTx = JsonBigInt.stringify(testData.txs.lockTx);

      const extractor = new FiroRosenExtractor(testData.lockAddress, tokenMap);
      const result = extractor.get(validLockTx);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `FiroRosenExtractor.get` should return undefined when
     * there is only one output
     * @dependencies
     * @scenario
     * - mock tx with only one output
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when there is only one output', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.lessBoxes);

      const extractor = new FiroRosenExtractor(testData.lockAddress, tokenMap);
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `FiroRosenExtractor.get` should return undefined when
     * first output is not OP_RETURN
     * @dependencies
     * @scenario
     * - mock tx without OP_RETURN utxo
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when first output is not OP_RETURN', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.noOpReturn);

      const extractor = new FiroRosenExtractor(testData.lockAddress, tokenMap);
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `FiroRosenExtractor.get` should return undefined when
     * second output is not to lock address
     * @dependencies
     * @scenario
     * - mock tx with no output box to lock address
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when second output is not to lock address', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.noLock);

      const extractor = new FiroRosenExtractor(testData.lockAddress, tokenMap);
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `FiroRosenExtractor.get` should return undefined when
     * no data is extracted from OP_RETURN box
     * @dependencies
     * @scenario
     * - mock tx with invalid rosen data in OP_RETURN
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when no data is extracted from OP_RETURN box', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.invalidData);

      const extractor = new FiroRosenExtractor(testData.lockAddress, tokenMap);
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `FiroRosenExtractor.get` should return undefined when
     * token transformation is not possible
     * @dependencies
     * @scenario
     * - mock valid lock tx
     * - generate extractor with a tokenMap that does not support FIRO
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when token transformation is not possible', async () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.lockTx);

      const noNativeTokenMap = new TokenMap();
      await noNativeTokenMap.updateConfigByJson(TestUtils.noNativeTokens);
      const extractor = new FiroRosenExtractor(
        testData.lockAddress,
        noNativeTokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    /**
     * @target `FiroRosenExtractor.getAssetTransformation` should return transformation
     * successfully when FIRO is supported on target chain (Ergo)
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test
     * - check returned value
     * @expected
     * - it should return expected asset transformation
     */
    it('should return transformation successfully when FIRO is supported on target chain (Ergo)', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new FiroRosenExtractor(testData.lockAddress, tokenMap);
      const result = extractor.getAssetTransformation(lockUtxo, ERGO_CHAIN);

      expect(result).toStrictEqual(testData.rsFiroErgoTransformation);
    });

    /**
     * @target `FiroRosenExtractor.getAssetTransformation` should return undefined
     * when FIRO is NOT supported on target chain (Ethereum)
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test with unsupported target chain (Ethereum)
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when FIRO is NOT supported on target chain (Ethereum)', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new FiroRosenExtractor(testData.lockAddress, tokenMap);
      const result = extractor.getAssetTransformation(lockUtxo, ETHEREUM_CHAIN);

      expect(result).toBeUndefined();
    });
  });
});
