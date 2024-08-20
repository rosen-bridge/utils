import { EvmRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../TestUtils';
import { Transaction } from 'ethers';

describe('EvmRosenExtractor', () => {
  describe('get', () => {
    const chainName = 'ethereum';
    const nativeToken = 'eth';
    const extractor = new EvmRosenExtractor(
      testData.lockAddress,
      TestUtils.tokens,
      chainName,
      nativeToken
    );

    /**
     * @target `EvmRosenExtractor.get` should extract rosenData from
     * EVM locking native-asset transfer tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from EVM locking native-asset transfer tx successfully', () => {
      const validLockTx = testData.validNativeLockTx;
      const result = extractor.get(
        Transaction.from(validLockTx).serialized.substring(2)
      );

      expect(result).toStrictEqual(testData.rosenDataNative);
    });

    /**
     * @target `EvmRosenExtractor.get` should return undefined when
     * recipient is not the lock address and call data does not start with `transfer` signature
     * @dependencies
     * @scenario
     * - mock extractor with no ERC-20 nor eth transfer
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when recipient is not the lock address and call data does not start with `transfer` signature', () => {
      const invalidTx = testData.noLockNoTransfer;
      const result = extractor.get(
        Transaction.from(invalidTx).serialized.substring(2)
      );

      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRosenExtractor.get` should return undefined when
     * serialized transaction is invalid
     * @dependencies
     * @scenario
     * - mock invalid transaction
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when serialized transaction is invalid', () => {
      const validTx = testData.validNativeLockTx;
      const result = extractor.get(
        Transaction.from(validTx).serialized.substring(2) + '0000'
      );

      expect(result).toBeUndefined();
    });
  });
});
