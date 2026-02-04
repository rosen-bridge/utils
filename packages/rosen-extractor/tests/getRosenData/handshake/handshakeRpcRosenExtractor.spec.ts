import { HandshakeRpcRosenExtractor } from '../../../lib';
import * as testData from './rpcTestData';
import TestUtils from '../testUtils';
import { ERGO_CHAIN, CARDANO_CHAIN } from '../../../lib/getRosenData/const';
import { TokenMap } from '@rosen-bridge/tokens';
import { HandshakeRpcTransaction } from '../../../lib/getRosenData/handshake/types';

describe('HandshakeRpcRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `HandshakeRpcRosenExtractor.get` should extract rosenData from
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
      const validLockTx = testData.txs.lockTx;

      const extractor = new HandshakeRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(validLockTx as HandshakeRpcTransaction);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `HandshakeRpcRosenExtractor.get` should return undefined when
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

      const extractor = new HandshakeRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `HandshakeRpcRosenExtractor.get` should return undefined when
     * no data outputs are found
     * @dependencies
     * @scenario
     * - mock tx without data outputs
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when no data outputs are found', () => {
      const invalidTx = testData.txs.noDataOutputs;

      const extractor = new HandshakeRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `HandshakeRpcRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.noLock;

      const extractor = new HandshakeRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `HandshakeRpcRosenExtractor.get` should return undefined when
     * data cannot be parsed
     * @dependencies
     * @scenario
     * - mock tx with invalid rosen data (invalid toChain code)
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when data cannot be parsed', () => {
      const invalidTx = testData.txs.invalidData;

      const extractor = new HandshakeRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `HandshakeRpcRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.lockTx;

      const noNativeTokenMap = new TokenMap();
      await noNativeTokenMap.updateConfigByJson(TestUtils.noNativeTokens);
      const extractor = new HandshakeRpcRosenExtractor(
        testData.lockAddress,
        noNativeTokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    /**
     * @target `HandshakeRpcRosenExtractor.getAssetTransformation` should return transformation
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

      const extractor = new HandshakeRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(lockUtxo, ERGO_CHAIN);

      expect(result).toStrictEqual(testData.hnsTransformation);
    });

    /**
     * @target `HandshakeRpcRosenExtractor.getAssetTransformation` should return undefined
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

      const extractor = new HandshakeRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(lockUtxo, CARDANO_CHAIN);

      expect(result).toBeUndefined();
    });
  });
});
