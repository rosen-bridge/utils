import {
  decodeErgoAddress,
  encodeErgoAddress,
  UnsupportedAddressError,
  validateErgoAddress,
} from '../lib';
import * as testData from './testData';

describe('encodeErgoAddress', () => {
  /**
   * @target `encodeErgoAddress` should encode Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be public key of given address in hex
   */
  it('should encode Ergo address successfully', () => {
    const res = encodeErgoAddress(testData.ergoAddress);
    expect(res).toEqual(testData.encodedErgoAddress);
  });

  /**
   * @target `encodeErgoAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      encodeErgoAddress(testData.longErgoAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('decodeErgoAddress', () => {
  /**
   * @target `decodeErgoAddress` should decode Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in base58 format
   */
  it('should decode Ergo address successfully', () => {
    const res = decodeErgoAddress(testData.encodedErgoAddress);
    expect(res).toEqual(testData.ergoAddress);
  });

  /**
   * @target `decodeErgoAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      decodeErgoAddress(testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('validateErgoAddress', () => {
  /**
   * @target `validateErgoAddress` should validate Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Ergo address
   */
  it('should validate Ergo address successfully', () => {
    expect(() => {
      validateErgoAddress(testData.ergoAddress);
    }).not.toThrow();
  });

  /**
   * @target `validateErgoAddress` should throw error for wrong Ergo address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Ergo address
   */
  it('should throw error for wrong Ergo address', () => {
    expect(() => {
      validateErgoAddress(testData.invalidErgoAddress);
    }).toThrow();
  });
});
