import {
  decodeFiroAddress,
  encodeFiroAddress,
  UnsupportedAddressError,
  validateFiroAddress,
} from '../lib';
import * as testData from './testData';

describe('encodeFiroAddress', () => {
  /**
   * @target `encodeFiroAddress` should encode Firo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should encode Firo address successfully', () => {
    const res = encodeFiroAddress(testData.firoAddress);
    expect(res).toEqual(testData.encodedFiroAddress);
  });
});

describe('decodeFiroAddress', () => {
  /**
   * @target `decodeFiroAddress` should decode Firo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Firo address successfully', () => {
    const res = decodeFiroAddress(testData.encodedFiroAddress);
    expect(res).toEqual(testData.firoAddress);
  });

  /**
   * @target `decodeFiroAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      decodeFiroAddress(testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('validateFiroAddress', () => {
  /**
   * @target `validateFiroAddress` should validate Firo address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Firo address
   */
  it('should validate Firo address successfully', () => {
    expect(() => {
      validateFiroAddress(testData.firoAddress);
    }).not.toThrow();
  });

  /**
   * @target `validateFiroAddress` should throw error for wrong Firo address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Firo address
   */
  it('should throw error for wrong Firo address', () => {
    expect(() => {
      validateFiroAddress(testData.invalidFiroAddress);
    }).toThrowError();
  });
});
