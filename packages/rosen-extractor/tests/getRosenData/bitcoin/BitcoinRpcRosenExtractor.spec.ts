import { BitcoinRpcRosenExtractor } from '../../../lib';
import * as testData from './rpcTestData';
import TestUtils from '../TestUtils';
import { ERGO_CHAIN, CARDANO_CHAIN } from '../../../lib/getRosenData/const';
import { BitcoinRpcTransaction } from '../../../lib/getRosenData/bitcoin/types';

describe('BitcoinRpcRosenExtractor', () => {
  describe('get', () => {
    /**
     * @target `BitcoinRpcRosenExtractor.get` should extract rosenData from
     * BTC locking tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from BTC locking tx successfully', () => {
      const validLockTx = testData.txs.lockTx;

      const extractor = new BitcoinRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(validLockTx as BitcoinRpcTransaction);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `BitcoinRpcRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(invalidTx as BitcoinRpcTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRpcRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(invalidTx as BitcoinRpcTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRpcRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(invalidTx as BitcoinRpcTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRpcRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(invalidTx as BitcoinRpcTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinRpcRosenExtractor.get` should return undefined when
     * token transformation is not possible
     * @dependencies
     * @scenario
     * - mock valid lock tx
     * - generate extractor with a tokenMap that does not support BTC
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when token transformation is not possible', () => {
      const invalidTx = testData.txs.lockTx;

      const extractor = new BitcoinRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.get(invalidTx as BitcoinRpcTransaction);

      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    /**
     * @target `BitcoinRpcRosenExtractor.getAssetTransformation` should return transformation
     * successfully when BTC is supported on target chain
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test
     * - check returned value
     * @expected
     * - it should return expected asset transformation
     */
    it('should return transformation successfully when BTC is supported on target chain', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new BitcoinRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(lockUtxo, ERGO_CHAIN);

      expect(result).toStrictEqual(testData.btcTransformation);
    });

    /**
     * @target `BitcoinRpcRosenExtractor.getAssetTransformation` should return undefined
     * when BTC is NOT supported on target chain
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test with unsupported target chain
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when BTC is NOT supported on target chain', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new BitcoinRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(lockUtxo, CARDANO_CHAIN);

      expect(result).toBeUndefined();
    });
  });
});
