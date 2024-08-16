import { EvmRpcRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../TestUtils';
import { Transaction, Signature, TransactionLike } from 'ethers';
import * as addressCodec from '@rosen-bridge/address-codec';

jest.mock('@rosen-bridge/address-codec', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@rosen-bridge/address-codec'),
  };
});

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

    const txLikeToTxResponse = (txLike: TransactionLike) => {
      const tx = Transaction.from(txLike);
      const txResJson = tx.toJSON();
      txResJson.signature = Signature.from(txResJson.sig);
      delete txResJson.sig;
      txResJson.from = tx.from!.toLowerCase();
      txResJson.hash = tx.hash;
      if (txResJson.to != null) {
        txResJson.to = txResJson.to.toLowerCase();
      }
      return Transaction.from(txResJson);
    };

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
      const txRes = txLikeToTxResponse(testData.validErc20LockTx);
      const result = extractor.get(txRes);

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
      const result = extractor.get(txLikeToTxResponse(validLockTx));

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
      const result = extractor.get(txLikeToTxResponse(invalidTx));

      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
     * target chain does not support token and transaction is an ERC-20 token transfer
     * @dependencies
     * @scenario
     * - mock transaction with target chain does not support token
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it('should return undefined when target chain does not support token and transaction is an ERC-20 token transfer', () => {
      const invalidTx = testData.invalidTxTargetNoToken;
      const result = extractor.get(txLikeToTxResponse(invalidTx));
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
      const result = extractor.get(txLikeToTxResponse(invalidTx));
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
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
      const result = extractor.get(txLikeToTxResponse(invalidTx));
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
     * native token is not in the source chain's token map
     * @dependencies
     * @scenario
     * - mock extractor with token map lacking the native token
     * - run test
     * - check returned value
     * @expected
     * - it should return undefined
     */
    it("should return undefined when native token is not in the source chain's token map", () => {
      const invalidExtractor = new EvmRpcRosenExtractor(
        testData.lockAddress,
        TestUtils.tokens,
        chainName,
        'NA'
      );
      const invalidTx = testData.validNativeLockTx;
      const result = invalidExtractor.get(txLikeToTxResponse(invalidTx));
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
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
      const result = extractor.get(txLikeToTxResponse(invalidTx));
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
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
        invalidTx.data!.substring(0, 14) + 'e' + invalidTx.data!.substring(15);
      const result = extractor.get(txLikeToTxResponse(invalidTx));
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
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
        invalidTx.to!.substring(0, 10) + '0' + invalidTx.to!.substring(11);
      const result = extractor.get(txLikeToTxResponse(invalidTx));
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRpcRosenExtractor.get` should return undefined when
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
      const len = invalidTx.data!.length;
      invalidTx.data = invalidTx.data!.substring(0, len - 10);
      const result = extractor.get(txLikeToTxResponse(invalidTx));
      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmRosenExtractor.get` should return undefined when
     * validateAddress throws error
     * @dependencies
     * @scenario
     * - mock valid rosen data tx
     * - mock `validateAddress` to throw error
     * - run test
     * - check returned value
     * @expected
     * - to return undefined
     */
    it('should return undefined when validateAddress throws error', () => {
      const txRes = txLikeToTxResponse(testData.validErc20LockTx);
      jest.spyOn(addressCodec, 'validateAddress').mockImplementation(() => {
        throw addressCodec.UnsupportedAddressError;
      });
      const result = extractor.get(txRes);

      expect(result).toBeUndefined();
    });
  });
});
