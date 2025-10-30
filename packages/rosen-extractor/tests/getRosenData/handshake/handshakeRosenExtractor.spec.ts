import { HandshakeRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../testUtils';
import { ERGO_CHAIN, CARDANO_CHAIN } from '../../../lib/getRosenData/const';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap } from '@rosen-bridge/tokens';

describe('HandshakeRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `HandshakeRosenExtractor.get` should extract rosenData from
     * Handshake locking tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from Handshake locking tx successfully', () => {
      const validLockTx = JsonBigInt.stringify(testData.txs.lockTx);

      const extractor = new HandshakeRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(validLockTx);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `HandshakeRosenExtractor.get` should return undefined when
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

      const extractor = new HandshakeRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `HandshakeRosenExtractor.get` should return undefined when
     * no valid OP_RETURN output is found
     * @dependencies
     * @scenario
     * - mock tx without OP_RETURN utxo
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when no valid OP_RETURN output is found', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.noOpReturn);

      const extractor = new HandshakeRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `HandshakeRosenExtractor.get` should return undefined when
     * no output with the lock address is found
     * @dependencies
     * @scenario
     * - mock tx with no output box to lock address
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when no output with the lock address is found', () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.noLock);

      const extractor = new HandshakeRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `HandshakeRosenExtractor.get` should return undefined when
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

      const extractor = new HandshakeRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `HandshakeRosenExtractor.get` should return undefined when
     * token transformation is not possible
     * @dependencies
     * @scenario
     * - mock valid lock tx
     * - generate extractor with a tokenMap that does not support HNS
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when token transformation is not possible', async () => {
      const invalidTx = JsonBigInt.stringify(testData.txs.lockTx);

      const noNativeTokenMap = new TokenMap();
      await noNativeTokenMap.updateConfigByJson(TestUtils.noNativeTokens);
      const extractor = new HandshakeRosenExtractor(
        testData.lockAddress,
        noNativeTokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    /**
     * @target `HandshakeRosenExtractor.getAssetTransformation` should return transformation
     * successfully when HNS is supported on target chain
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test
     * - check returned value
     * @expected
     * - it should return expected asset transformation
     */
    it('should return transformation successfully when HNS is supported on target chain', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new HandshakeRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(lockUtxo, ERGO_CHAIN);

      expect(result).toStrictEqual(testData.hnsTransformation);
    });

    /**
     * @target `HandshakeRosenExtractor.getAssetTransformation` should return undefined
     * when HNS is NOT supported on target chain
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test with unsupported target chain
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when HNS is NOT supported on target chain', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new HandshakeRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(lockUtxo, CARDANO_CHAIN);

      expect(result).toBeUndefined();
    });
  });
});
