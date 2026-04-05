import {
  decodeBitcoinAddress,
  encodeBitcoinAddress,
  UnsupportedAddressError,
  validateBitcoinAddress,
} from '../lib';
import * as testData from './testData';

describe('encodeBitcoinAddress', () => {
  /**
   * @target `encodeBitcoinAddress` should encode Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should encode Bitcoin address successfully', () => {
    const res = encodeBitcoinAddress(testData.bitcoinAddress);
    expect(res).toEqual(testData.encodedBitcoinAddress);
  });
});

describe('decodeBitcoinAddress', () => {
  /**
   * @target `decodeBitcoinAddress` should decode Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Bitcoin address successfully', () => {
    const res = decodeBitcoinAddress(testData.encodedBitcoinAddress);
    expect(res).toEqual(testData.bitcoinAddress);
  });

  /**
   * @target `decodeBitcoinAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      decodeBitcoinAddress(testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('validateBitcoinAddress', () => {
  /**
   * @target `validateBitcoinAddress` should validate Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Bitcoin address
   */
  it('should validate Bitcoin address successfully', () => {
    expect(() => {
      validateBitcoinAddress(testData.bitcoinAddress);
    }).not.toThrow();
  });

  /**
   * @target `validateBitcoinAddress` should throw error for Bitcoin taproot address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for Bitcoin taproot address
   */
  it('should throw error for Bitcoin taproot address', () => {
    expect(() => {
      validateBitcoinAddress(testData.taprootBitcoinAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateBitcoinAddress` should throw error for wrong Bitcoin address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Bitcoin address
   */
  it('should throw error for wrong Bitcoin address', () => {
    expect(() => {
      validateBitcoinAddress(testData.invalidBitcoinAddress);
    }).toThrowError();
  });
});
