import { BitcoinEsploraRosenExtractor } from '../../../lib';
import * as testData from './esploraTestData';
import TestUtils from '../TestUtils';
import { ERGO_CHAIN, CARDANO_CHAIN } from '../../../lib/getRosenData/const';
import { BitcoinEsploraTransaction } from '../../../lib/getRosenData/bitcoin/types';

describe('BitcoinEsploraRosenExtractor', () => {
  describe('get', () => {
    /**
     * @target `BitcoinEsploraRosenExtractor.get` should extract rosenData from
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

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(validLockTx as BitcoinEsploraTransaction);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.get` should return undefined when
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

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.noNativeTokens
      );
      const result = extractor.get(invalidTx as BitcoinEsploraTransaction);

      expect(result).toBeUndefined();
    });
  });

  describe('parseRosenData', () => {
    /**
     * @target `BitcoinEsploraRosenExtractor.parseRosenData` should extract rosen data successfully
     * @dependencies
     * @scenario
     * - mock utxo with scriptPubKey that contains valid rosen data
     * - run test
     * - check returned value
     * @expected
     * - it should return expected asset transformation
     */
    it('should extract rosen data successfully', () => {
      const script = testData.opReturnScripts.valid;

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.parseRosenData(script);

      expect(result).toStrictEqual(testData.opReturnData);
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.parseRosenData` should throw error
     * when script does not start with OP_RETURN opcode
     * @dependencies
     * @scenario
     * - mock utxo with scriptPubKey that does not contain OP_RETURN opcode
     * - run test & check thrown exception
     * @expected
     * - it should throw error
     */
    it('should throw error when script does not start with OP_RETURN opcode', () => {
      const script = testData.opReturnScripts.noOpReturn;

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );

      expect(() => {
        extractor.parseRosenData(script);
      }).toThrow(Error);
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.parseRosenData` should throw error
     * when second opcode is not OP_PUSHDATA1 opcode
     * @dependencies
     * @scenario
     * - mock utxo with scriptPubKey that does not contain OP_PUSHDATA1 opcode
     * - run test & check thrown exception
     * @expected
     * - it should throw error
     */
    it('should throw error when second opcode is not OP_PUSHDATA1 opcode', () => {
      const script = testData.opReturnScripts.noPushData;

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );

      expect(() => {
        extractor.parseRosenData(script);
      }).toThrow(Error);
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.parseRosenData` should throw error
     * when toChain is invalid
     * @dependencies
     * @scenario
     * - mock utxo with scriptPubKey that contain rosen data with invalid toChain
     * - run test & check thrown exception
     * @expected
     * - it should throw error
     */
    it('should throw error when toChain is invalid', () => {
      const script = testData.opReturnScripts.invalidToChain;

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );

      expect(() => {
        extractor.parseRosenData(script);
      }).toThrow(Error);
    });
  });

  describe('getAssetTransformation', () => {
    /**
     * @target `BitcoinEsploraRosenExtractor.getAssetTransformation` should return transformation
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

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(lockUtxo, ERGO_CHAIN);

      expect(result).toStrictEqual(testData.btcTransformation);
    });

    /**
     * @target `BitcoinEsploraRosenExtractor.getAssetTransformation` should return undefined
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

      const extractor = new BitcoinEsploraRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens
      );
      const result = extractor.getAssetTransformation(lockUtxo, CARDANO_CHAIN);

      expect(result).toBeUndefined();
    });
  });
});
