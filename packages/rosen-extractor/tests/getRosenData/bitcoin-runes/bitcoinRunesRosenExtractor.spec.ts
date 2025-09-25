import { BitcoinRunesRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../testUtils';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap } from '@rosen-bridge/tokens';
import { ERGO_CHAIN } from '../../../lib/getRosenData/const';

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
     */
    it('should extract rosenData from Runes lock tx successfully', () => {
      const validLockTx = JsonBigInt.stringify(testData.txs.lockTx);

      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(validLockTx);

      expect(result).toStrictEqual(testData.rosenData);
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
     * @target `BitcoinRunesRosenExtractor.get` should extract rosenData from
     * Runes lock tx successfully when the utxos are unorganized
     * @dependencies
     * @scenario
     * - mock a tx with incorrectly ordered utxos
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from Runes lock tx successfully when the utxos are unorganized', () => {
      const unorderedTx = JsonBigInt.stringify(testData.txs.unorderedTx);

      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(unorderedTx);

      expect(result).toStrictEqual(testData.rosenData);
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

  describe('getAssetTransformation', () => {
    const toChain = ERGO_CHAIN;

    /**
     * @target: BitcoinRunesRosenExtractor.getAssetTransformation should extract asset transformation
     * from token locked UTxO successfully
     * @dependencies:
     * @scenario
     * - mock a UTxO with valid asset transformation
     * - run the test
     * - check returned value
     * @expected
     * - asset transformation should be extracted correctly
     */
    it('should extract asset transformation from token locked UTxO successfully', () => {
      // mock a UTxO with valid asset transformation
      const utxo = testData.lockUtxo.valid;

      // run the test
      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(utxo, toChain);

      // check returned value
      expect(result).toStrictEqual(testData.rosenAssetTransformations);
    });

    /**
     * @target: BitcoinRunesRosenExtractor.getAssetTransformation should return undefined
     * when there is no Runes in the UTxO
     * @dependencies:
     * @scenario
     * - mock a UTxO without any Runes
     * - run the test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when there is no Runes in the UTxO', () => {
      // mock a UTxO without any Runes
      const utxo = testData.lockUtxo.noRune;

      // run the test
      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(utxo, toChain);

      // check returned value
      expect(result).toBeUndefined();
    });

    /**
     * @target: BitcoinRunesRosenExtractor.getAssetTransformation should return undefined
     * when none of locked Runes is supported
     * @dependencies:
     * @scenario
     * - mock a UTxO with unsupported Runes
     * - run the test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when none of locked Runes is supported', () => {
      // mock a UTxO with unsupported Runes
      const utxo = testData.lockUtxo.noSupportedRune;

      // run the test
      const extractor = new BitcoinRunesRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(utxo, toChain);

      // check returned value
      expect(result).toBeUndefined();
    });
  });
});
