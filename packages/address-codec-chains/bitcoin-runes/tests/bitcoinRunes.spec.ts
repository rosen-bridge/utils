import {
  decodeBitcoinRunesAddress,
  encodeBitcoinRunesAddress,
  UnsupportedAddressError,
  validateBitcoinRunesAddress,
} from '../lib';
import * as testData from './testData';

describe('encodeBitcoinRunesAddress', () => {
  /**
   * @target `encodeBitcoinRunesAddress` should encode Runes address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should encode Runes address successfully', () => {
    const res = encodeBitcoinRunesAddress(testData.taprootBitcoinAddress);
    expect(res).toEqual(testData.encodedTaprootBitcoinAddress);
  });
});

describe('decodeBitcoinRunesAddress', () => {
  /**
   * @target `decodeBitcoinRunesAddress` should decode Runes address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Runes address successfully', () => {
    const res = decodeBitcoinRunesAddress(
      testData.encodedTaprootBitcoinAddress,
    );
    expect(res).toEqual(testData.taprootBitcoinAddress);
  });

  /**
   * @target `decodeBitcoinRunesAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      decodeBitcoinRunesAddress(testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('validateBitcoinRunesAddress', () => {
  /**
   * @target `validateBitcoinRunesAddress` should validate Runes address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Runes address
   */
  it('should validate Runes address successfully', () => {
    expect(() => {
      validateBitcoinRunesAddress(testData.taprootBitcoinAddress);
    }).not.toThrow();
  });

  /**
   * @target `validateBitcoinRunesAddress` should throw error for wrong Runes address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Runes address
   */
  it('should throw error for wrong Runes address', () => {
    expect(() => {
      validateBitcoinRunesAddress(testData.bitcoinAddress);
    }).toThrow(UnsupportedAddressError);
  });
});
