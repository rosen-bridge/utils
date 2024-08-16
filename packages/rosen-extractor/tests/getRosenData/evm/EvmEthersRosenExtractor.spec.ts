import { EvmEthersRosenExtractor } from '../../../lib';
import * as testData from './testData';
import TestUtils from '../TestUtils';
import { JsonRpcProvider, TransactionResponse } from 'ethers';
import * as addressCodec from '@rosen-bridge/address-codec';

jest.mock('@rosen-bridge/address-codec', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@rosen-bridge/address-codec'),
  };
});

describe('EvmEthersRosenExtractor', () => {
  describe('get', () => {
    const chainName = 'ethereum';
    const nativeToken = 'eth';
    const extractor = new EvmEthersRosenExtractor(
      testData.lockAddress,
      TestUtils.tokens,
      chainName,
      nativeToken
    );

    /**
     * @target `EvmEthersRosenExtractor.get` should extract rosenData from
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
        new TransactionResponse(validLockTx as any, new JsonRpcProvider())
      );

      expect(result).toStrictEqual(testData.rosenDataNative);
    });

    /**
     * @target `EvmEthersRosenExtractor.get` should return undefined when
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
        new TransactionResponse(invalidTx as any, new JsonRpcProvider())
      );

      expect(result).toBeUndefined();
    });

    /**
     * @target `EvmEthersRosenExtractor.get` should return undefined when
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
      const validLockTx = testData.validNativeLockTx;
      jest.spyOn(addressCodec, 'validateAddress').mockImplementation(() => {
        throw addressCodec.UnsupportedAddressError;
      });
      const result = extractor.get(
        new TransactionResponse(validLockTx as any, new JsonRpcProvider())
      );

      expect(result).toBeUndefined();
    });
  });
});
