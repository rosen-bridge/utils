import { EvmRpcRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../TestUtils';
import { TransactionResponse, JsonRpcProvider } from 'ethers';

describe('EvmRpcRosenExtractor', () => {
  describe('get', () => {
    const chainName = 'ethereum';
    const nativeToken = 'eth';
    let extractor: EvmRpcRosenExtractor;

    beforeEach(() => {
      extractor = new EvmRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens,
        chainName,
        nativeToken
      );
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should extract rosenData from
     * Evm locking ERC-20 tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from Ethereum locking ERC-20 transfer tx successfully', () => {
      const validLockTx = testData.validErc20LockTx;
      const result = extractor.get(
        new TransactionResponse(validLockTx, new JsonRpcProvider())
      );

      expect(result).toStrictEqual(testData.rosenDataErc20);
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should extract rosenData from
     * Evm locking native-asset transfer tx successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosenData object
     */
    it('should extract rosenData from Ethereum locking native-asset transfer tx successfully', () => {
      const validLockTx = testData.validNativeLockTx;
      const result = extractor.get(
        new TransactionResponse(validLockTx, new JsonRpcProvider())
      );

      expect(result).toStrictEqual(testData.rosenDataNative);
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
     * recipient is not the lock address and call data does not start with `transfer` signature
     * @dependencies
     * @scenario
     * - mock extractor with wrong native token name
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when recipient is not the lock address and call data does not start with `transfer` signature', () => {
      const invalidTx = testData.noLockNoTransfer;
      const result = extractor.get(
        new TransactionResponse(invalidTx, new JsonRpcProvider())
      );

      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
     * target chain does not support eth and transaction is a native token transfer
     * @dependencies
     * @scenario
     * - mock extractor with wrong native token name
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when recipient is not the lock address and call data does not start with `transfer` signature', () => {
      const invalidTx = testData.invalidErc20LockTx;
      const result = extractor.get(
        new TransactionResponse(invalidTx, new JsonRpcProvider())
      );
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcaRosenExtractor.get` should return undefined when
     * transaction is a native token transfer and `to` is not lock address
     * @dependencies
     * @scenario
     * - mock native token transfer transaction with wrong recipient
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when transaction is a native token transfer and `to` is not lock address', () => {
      const invalidTx = { ...testData.validNativeLockTx };
      invalidTx.to = '0x4606deeeeeeb17d29e8c5e4085f9a868a8e5e4f2';
      const result = extractor.get(
        new TransactionResponse(invalidTx, new JsonRpcProvider())
      );
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcaRosenExtractor.get` should return undefined when
     * transaction is an ERC-20 transfer and `recipient` is not lock address
     * @dependencies
     * @scenario
     * - mock ERC-20 transfer transaction with wrong recipient
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when transaction is an ERC-20 transfer and `recipient` is not lock address', () => {
      const invalidTx = { ...testData.validErc20LockTx };
      invalidTx.data =
        invalidTx.data.substring(0, 14) + 'e' + invalidTx.data.substring(15);
      const result = extractor.get(
        new TransactionResponse(invalidTx, new JsonRpcProvider())
      );
      expect(result).toBeUndefined();
    });
  });
});
