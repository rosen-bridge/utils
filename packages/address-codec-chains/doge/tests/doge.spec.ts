import {
  decodeDogeAddress,
  encodeDogeAddress,
  UnsupportedAddressError,
  validateDogeAddress,
} from '../lib';
import * as testData from './testData';

describe('encodeDogeAddress', () => {
  /**
   * @target `encodeDogeAddress` should encode Doge address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should encode Doge address successfully', () => {
    const res = encodeDogeAddress(testData.dogeAddress);
    expect(res).toEqual(testData.encodedDogeAddress);
  });
});

describe('decodeDogeAddress', () => {
  /**
   * @target `decodeDogeAddress` should decode Doge address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Doge address successfully', () => {
    const res = decodeDogeAddress(testData.encodedDogeAddress);
    expect(res).toEqual(testData.dogeAddress);
  });

  /**
   * @target `decodeDogeAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      decodeDogeAddress(testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('validateDogeAddress', () => {
  /**
   * @target `validateDogeAddress` should validate Doge address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Doge address
   */
  it('should validate Doge address successfully', () => {
    expect(() => {
      validateDogeAddress(testData.dogeAddress);
    }).not.toThrow();
  });

  /**
   * @target `validateDogeAddress` should throw error for wrong Doge address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Doge address
   */
  it('should throw error for wrong Doge address', () => {
    expect(() => {
      validateDogeAddress(testData.invalidDogeAddress);
    }).toThrowError();
  });
});
