import { BitcoinRunesRpcRosenExtractor } from '../../../lib';
import * as testData from './rpcTestData';
import TestUtils from '../testUtils';
import { BitcoinRpcTransaction } from '../../../lib/getRosenData/bitcoin/types';
import { TokenMap } from '@rosen-bridge/tokens';

describe('BitcoinRunesRpcRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `BitcoinRunesRpcRosenExtractor.get` should extract rosenData from
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

      const extractor = new BitcoinRunesRpcRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(validLockTx as BitcoinRpcTransaction);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `BitcoinRunesRpcRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRunesRpcRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx as BitcoinRpcTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRunesRpcRosenExtractor.get` should extract rosenData from
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
      const unorderedTx = testData.txs.unorderedTx;

      const extractor = new BitcoinRunesRpcRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(unorderedTx as BitcoinRpcTransaction);

      expect(result).toStrictEqual(testData.rosenData2);
    });

    /**
     * @target `BitcoinRunesRpcRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRunesRpcRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx as BitcoinRpcTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRunesRpcRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRunesRpcRosenExtractor(
        testData.mockLockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx as BitcoinRpcTransaction);

      expect(result).toBeUndefined();
    });
  });
});
