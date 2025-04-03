import * as testData from './blockcypherTestData';
import TestUtils from '../TestUtils';
import { ERGO_CHAIN, CARDANO_CHAIN } from '../../../lib/getRosenData/const';
import { DogeBlockcypherTransaction } from '../../../lib/getRosenData/doge/types';
import { DogeBlockcypherRosenExtractor } from '../../../lib/getRosenData/doge/DogeBlockcypherRosenExtractor';
import { TokenMap } from '@rosen-bridge/tokens';

describe('DogeBlockcypherRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `DogeBlockcypherRosenExtractor.get` should extract rosenData from
     * DOGE locking tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from DOGE locking tx successfully', () => {
      const validLockTx = testData.txs.lockTx;

      const extractor = new DogeBlockcypherRosenExtractor(
        testData.lockAddress,
        tokenMap
      );
      const result = extractor.get(validLockTx as DogeBlockcypherTransaction);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `DogeBlockcypherRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.lessBoxes;

      const extractor = new DogeBlockcypherRosenExtractor(
        testData.lockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx as DogeBlockcypherTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `DogeBlockcypherRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.noOpReturn;

      const extractor = new DogeBlockcypherRosenExtractor(
        testData.lockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx as DogeBlockcypherTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `DogeBlockcypherRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.noLock;

      const extractor = new DogeBlockcypherRosenExtractor(
        testData.lockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx as DogeBlockcypherTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `DogeBlockcypherRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.invalidData;

      const extractor = new DogeBlockcypherRosenExtractor(
        testData.lockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx as DogeBlockcypherTransaction);

      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    /**
     * @target `DogeBlockcypherRosenExtractor.getAssetTransformation` should return transformation
     * successfully when DOGE is supported on target chain
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test
     * - check returned value
     * @expected
     * - it should return expected asset transformation
     */
    it('should return transformation successfully when DOGE is supported on target chain', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new DogeBlockcypherRosenExtractor(
        testData.lockAddress,
        tokenMap
      );
      const result = extractor.getAssetTransformation(lockUtxo, ERGO_CHAIN);

      expect(result).toStrictEqual(testData.dogeTransformation);
    });

    /**
     * @target `DogeBlockcypherRosenExtractor.getAssetTransformation` should return undefined
     * when DOGE is NOT supported on target chain
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test with unsupported target chain
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when DOGE is NOT supported on target chain', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new DogeBlockcypherRosenExtractor(
        testData.lockAddress,
        tokenMap
      );
      const result = extractor.getAssetTransformation(lockUtxo, CARDANO_CHAIN);

      expect(result).toBeUndefined();
    });
  });
});
