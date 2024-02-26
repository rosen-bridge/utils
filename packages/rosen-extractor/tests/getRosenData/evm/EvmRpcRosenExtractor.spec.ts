import { EvmRpcRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../TestUtils';
import { TransactionResponse, JsonRpcProvider } from 'ethers';

describe('EvmRpcRosenExtractor', () => {
  describe('get', () => {
    const chainName = 'ethereum';
    const nativeToken = 'eth';
    const extractor = new EvmRpcRosenExtractor(
      testData.lockAddress,
      TestUtils.tokens,
      chainName,
      nativeToken
    );

    /**
     * @target `EvmRpcRosenExtractor.get` should extract rosenData from Ethereum
     * locking ERC-20 transfer tx successfully
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
        new TransactionResponse(validLockTx, new JsonRpcProvider())
      );

      expect(result).toStrictEqual(testData.rosenDataNative);
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
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
        new TransactionResponse(invalidTx, new JsonRpcProvider())
      );

      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
     * target chain does not support eth and transaction is a native token transfer
     * @dependencies
     * @scenario
     * - mock transaction with target chain does not support eth
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when target chain does not support eth and transaction is a native token transfer', () => {
      const invalidTx = testData.invalidTxTargetNoNative;
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
     * `to` is empty
     * @dependencies
     * @scenario
     * - mock transaction with empty `to`
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when `to` is empty', () => {
      const invalidTx = testData.invalidTrxNoTo;
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

    /**
     * @target `EvmRpcaRosenExtractor.get` should return undefined when
     * transaction is an ERC-20 transfer and token is not supported in the source chain
     * @dependencies
     * @scenario
     * - mock ERC-20 transfer transaction with wrong recipient
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when transaction is an ERC-20 transfer and token is not supported in the source chain', () => {
      const invalidTx = { ...testData.validErc20LockTx };
      invalidTx.to =
        invalidTx.to.substring(0, 10) + '0' + invalidTx.to.substring(11);
      const result = extractor.get(
        new TransactionResponse(invalidTx, new JsonRpcProvider())
      );
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcaRosenExtractor.get` should return undefined when
     * calldata can not be parsed to rosen data
     * @dependencies
     * @scenario
     * - mock ERC-20 transfer transaction with malformed calldata
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when calldata can not be parsed to rosen data', () => {
      const invalidTx = { ...testData.validErc20LockTx };
      const len = invalidTx.data.length;
      invalidTx.data = invalidTx.data.substring(0, len - 10);
      const result = extractor.get(
        new TransactionResponse(invalidTx, new JsonRpcProvider())
      );
      expect(result).toBeUndefined();
    });
  });
});
