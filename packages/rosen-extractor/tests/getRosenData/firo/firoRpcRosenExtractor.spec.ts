import { FiroRpcRosenExtractor } from '../../../lib';
import * as testData from './rpcTestData';
import TestUtils from '../testUtils';
import { ETHEREUM_CHAIN, ERGO_CHAIN } from '../../../lib/getRosenData/const';
import { TokenMap } from '@rosen-bridge/tokens';
import { FiroRpcTransaction } from '../../../lib/getRosenData/firo/types';

describe('FiroRpcRosenExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.tokens);
  });

  describe('get', () => {
    /**
     * @target `FiroRpcRosenExtractor.get` should extract rosenData from
     * FIRO locking tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from FIRO locking tx successfully', () => {
      const validLockTx = testData.txs.lockTx;

      const extractor = new FiroRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(validLockTx as FiroRpcTransaction);

      expect(result).toStrictEqual(testData.rosenData);
    });

    /**
     * @target `FiroRpcRosenExtractor.get` should return undefined when
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

      const extractor = new FiroRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `FiroRpcRosenExtractor.get` should return undefined when
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
      const invalidTx = testData.txs.noOpReturn;

      const extractor = new FiroRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `FiroRpcRosenExtractor.get` should return undefined when
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

      const extractor = new FiroRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `FiroRpcRosenExtractor.get` should return undefined when
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

      const extractor = new FiroRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });

    /**
     * @target `FiroRpcRosenExtractor.get` should return undefined when
     * token transformation is not possible
     * @dependencies
     * @scenario
     * - mock valid lock tx
     * - generate extractor with a tokenMap that does not support FIRO
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when token transformation is not possible', async () => {
      const invalidTx = testData.txs.lockTx;

      const noNativeTokenMap = new TokenMap();
      await noNativeTokenMap.updateConfigByJson(TestUtils.noNativeTokens);
      const extractor = new FiroRpcRosenExtractor(
        testData.lockAddress,
        noNativeTokenMap,
      );
      const result = extractor.get(invalidTx);

      expect(result).toBeUndefined();
    });
  });

  describe('getAssetTransformation', () => {
    /**
     * @target `FiroRpcRosenExtractor.getAssetTransformation` should return transformation
     * successfully when FIRO is supported on target chain (Ergo)
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test
     * - check returned value
     * @expected
     * - it should return expected asset transformation
     */
    it('should return transformation successfully when FIRO is supported on target chain (Ergo)', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new FiroRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(lockUtxo, ERGO_CHAIN);

      expect(result).toStrictEqual(testData.rsFiroErgoTransformation);
    });

    /**
     * @target `FiroRpcRosenExtractor.getAssetTransformation` should return undefined
     * when FIRO is NOT supported on target chain (Ethereum)
     * @dependencies
     * @scenario
     * - mock utxo
     * - run test with unsupported target chain (Ethereum)
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when FIRO is NOT supported on target chain (Ethereum)', () => {
      const lockUtxo = testData.lockUtxo;

      const extractor = new FiroRpcRosenExtractor(
        testData.lockAddress,
        tokenMap,
      );
      const result = extractor.getAssetTransformation(lockUtxo, ETHEREUM_CHAIN);

      expect(result).toBeUndefined();
    });
  });
});
