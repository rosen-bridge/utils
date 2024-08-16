import { ErgoRosenExtractor } from '../../../lib';
import ErgoTestData from './ErgoTestData';
import TestUtils from '../TestUtils';
import * as addressCodec from '@rosen-bridge/address-codec';

jest.mock('@rosen-bridge/address-codec', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@rosen-bridge/address-codec'),
  };
});

describe('ErgoRosenExtractor', () => {
  const lockAddress =
    'nB3L2PD3LG4ydEj62n9aymRyPCEbkBdzaubgvCWDH2oxHxFBfAUy9GhWDvteDbbUh5qhXxnW8R46qmEiZfkej8gt4kZYvbeobZJADMrWXwFJTsZ17euEcoAp3KDk31Q26okFpgK9SKdi4';
  describe('get', () => {
    /**
     * Target: ErgoRosenExtractor.get should extract rosenData from locking tx
     *  successfully
     * Dependencies:
     * - N/A
     * Scenario:
     * - generate a transaction with valid rosen data
     * - run test
     * - check return value
     * Expected:
     * - function returns rosenData object
     */
    it('should extract rosenData from locking tx successfully', () => {
      // generate a transaction with valid rosen data
      const validLockTx = ErgoTestData.ergoSerializedTxs.lockTx;

      // run test
      const extractor = new ErgoRosenExtractor(lockAddress, TestUtils.tokens);
      const result = extractor.get(validLockTx);

      // check return value
      expect(result).toStrictEqual(ErgoTestData.ergoRosenData.lockTx);
    });

    /**
     * Target: ErgoRosenExtractor.get should return undefined when tx locks
     *  nothing
     * Dependencies:
     * - N/A
     * Scenario:
     * - generate a transaction with no lock box
     * - run test
     * - check return value
     * Expected:
     * - function returns rosenData object
     */
    it('should return undefined when tx locks nothing', () => {
      // generate a transaction with no lock box
      const noLock = ErgoTestData.ergoSerializedTxs.normalTx;

      // run test
      const extractor = new ErgoRosenExtractor(lockAddress, TestUtils.tokens);
      const result = extractor.get(noLock);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * Target: ErgoRosenExtractor.get should return undefined when serialized
     *  bytes of transaction is invalid
     * Dependencies:
     * - N/A
     * Scenario:
     * - generate an invalid serialized bytes
     * - run test
     * - check return value
     * Expected:
     * - function returns undefined
     */
    it('should return undefined when serialized bytes of transaction is invalid', () => {
      // generate an invalid serialized bytes
      const invalidBytes = ErgoTestData.ergoSerializedTxs.invalid;

      // run test
      const extractor = new ErgoRosenExtractor(lockAddress, TestUtils.tokens);
      const result = extractor.get(invalidBytes);

      // check return value
      expect(result).toBeUndefined();
    });

    /**
     * @target `ErgoNodeRosenExtractor.get` should return undefined when
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
      const validLockTx = ErgoTestData.ergoSerializedTxs.lockTx;
      jest.spyOn(addressCodec, 'validateAddress').mockImplementation(() => {
        throw addressCodec.UnsupportedAddressError;
      });

      const extractor = new ErgoRosenExtractor(lockAddress, TestUtils.tokens);
      const result = extractor.get(validLockTx);

      expect(result).toBeUndefined();
    });
  });
});
