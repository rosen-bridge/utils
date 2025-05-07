import { RunesEsploraRosenExtractor } from '../../../lib';
import * as testData from './esploraTestData';
import TestUtils from '../TestUtils';
import { BitcoinEsploraTransaction } from '../../../lib/getRosenData/bitcoin/types';
import { TokenMap } from '@rosen-bridge/tokens';

describe('RunesEsploraRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `RunesEsploraRosenExtractor.get` should extract rosenData from
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
      const validLockTx = testData.txs.lockTx;

      const extractor = new RunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(validLockTx as BitcoinEsploraTransaction);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `RunesEsploraRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.corruptData;

      const extractor = new RunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `RunesEsploraRosenExtractor.get` should extract rosenData from Runes lock tx successfully when
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
      const invalidTx = testData.txs.unorderedTx;

      const extractor = new RunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `RunesEsploraRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.lessBoxes;

      const extractor = new RunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `RunesEsploraRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.noLock;

      const extractor = new RunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });
  });
});
