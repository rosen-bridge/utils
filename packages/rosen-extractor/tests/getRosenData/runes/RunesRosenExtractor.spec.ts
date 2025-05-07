import { RunesRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../TestUtils';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap } from '@rosen-bridge/tokens';

describe('RunesRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `RunesRosenExtractor.get` should extract rosenData from
     * Runes lock tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from Runes lock tx successfully', () => {
      const validLockTx = JsonBigInt.stringify(testData.txs.lockTx);

      const extractor = new RunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(validLockTx);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `RunesRosenExtractor.get` should return undefined when
     * there is a corrupt scriptpubkey
     * @dependencies
     * @scenario
     * - mock a tx with a corrupt scriptpubkey
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when there is a corrupt scriptpubkey', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.corruptData);

      const extractor = new RunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `RunesRosenExtractor.get` should extract rosenData from Runes lock tx successfully when
     * the utxos are in an incorrect order
     * @dependencies
     * @scenario
     * - mock a tx with incorrectly ordered utxos
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from Runes lock tx successfully when the utxos are in an incorrect order', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.unorderedTx);

      const extractor = new RunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `RunesRosenExtractor.get` should return undefined when
     * there are not enough utxos
     * @dependencies
     * @scenario
     * - mock tx with not enough utxos
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when there are not enough utxos', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.lessBoxes);

      const extractor = new RunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `RunesRosenExtractor.get` should return undefined when
     * outputs contain no lock address utxo
     * @dependencies
     * @scenario
     * - mock tx with no output box to lock address
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when outputs contain no lock address utxo', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.noLock);

      const extractor = new RunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });
  });
});
