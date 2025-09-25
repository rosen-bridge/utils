import { BitcoinRunesRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../testUtils';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap } from '@rosen-bridge/tokens';

describe('BitcoinRunesRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `BitcoinRunesRosenExtractor.get` should extract rosenData from
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
      const validLockTx = JsonBigInt.stringify(testData.txs.lockTx);

      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      ) as any;
      const result = extractor.get(validLockTx);

      expect(result).toStrictEqual(testData.rosenData);
      // validate data by rawData
      const parsedRawData = extractor['lockDataFromChunks'](
        extractor['getLockDataChunks'](
          JsonBigInt.parse(testData.rosenData.rawData),
        ),
      );
      expect(testData.rosenData).toMatchObject(parsedRawData);
    });

    /**
     * @target `BitcoinRunesRosenExtractor.get` should return undefined when
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
      const invalidTx = JsonBigInt.stringify(testData.txs.corruptData);

      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRunesRosenExtractor.get` should return undefined when
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
      const unorderedTx = JsonBigInt.stringify(testData.txs.unorderedTx);

      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(unorderedTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRunesRosenExtractor.get` should return undefined when
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
      const lessBoxesTx = JsonBigInt.stringify(testData.txs.lessBoxes);

      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(lessBoxesTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRunesRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });
  });
});
