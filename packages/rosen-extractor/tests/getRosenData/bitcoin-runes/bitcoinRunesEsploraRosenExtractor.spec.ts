import { BitcoinRunesEsploraRosenExtractor } from '../../../lib';
import * as testData from './esploraTestData';
import TestUtils from '../testUtils';
import { BitcoinEsploraTransaction } from '../../../lib/getRosenData/bitcoin/types';
import { TokenMap } from '@rosen-bridge/tokens';

describe('BitcoinRunesEsploraRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `BitcoinRunesEsploraRosenExtractor.get` should extract rosenData from
     * Runes lock tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     * - it should contains all parsed data from rawData
     */
    it('should extract rosenData from Runes lock tx successfully', () => {
      const validLockTx = testData.txs.lockTx;

      const extractor = new BitcoinRunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      ) as any;
      const result = extractor.get(validLockTx as BitcoinEsploraTransaction);

      expect(result).toStrictEqual(testData.rosenData);
      // validate data by rawData
      const parsedRawData = extractor['lockDataFromChunks'](
        extractor['getLockDataChunks'](JSON.parse(testData.rosenData.rawData)),
      );
      expect(testData.rosenData).toMatchObject(parsedRawData);
    });

    /**
     * @target `BitcoinRunesEsploraRosenExtractor.get` should return undefined when
     * aggregated data is corrupted
     * @dependencies
     * @scenario
     * - mock a tx with a corrupt scriptpubkey
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when aggregated data is corrupted', () => {
      const invalidTx = testData.txs.corruptData;

      const extractor = new BitcoinRunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRunesEsploraRosenExtractor.get` should return undefined when
     * the utxos are unorganized
     * @dependencies
     * @scenario
     * - mock a tx with incorrectly ordered utxos
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should return undefined when the utxos are unorganized', () => {
      const unorderedTx = testData.txs.unorderedTx;

      const extractor = new BitcoinRunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(unorderedTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRunesEsploraRosenExtractor.get` should return undefined when
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
      const lessBoxesTx = testData.txs.lessBoxes;

      const extractor = new BitcoinRunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(lessBoxesTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRunesEsploraRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRunesEsploraRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });
  });
});
