import {
  decodeCardanoAddress,
  encodeCardanoAddress,
  UnsupportedAddressError,
  validateCardanoAddress,
} from '../lib';
import * as testData from './testData';

describe('encodeCardanoAddress', () => {
  /**
   * @target `encodeCardanoAddress` should encode Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be public key of given address in hex
   */
  it('should encode Cardano address successfully', () => {
    const res = encodeCardanoAddress(testData.cardanoAddress);
    expect(res).toEqual(testData.encodedCardanoAddress);
  });
});

describe('decodeCardanoAddress', () => {
  /**
   * @target `decodeCardanoAddress` should decode Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Cardano address successfully', () => {
    const res = decodeCardanoAddress(testData.encodedCardanoAddress);
    expect(res).toEqual(testData.cardanoAddress);
  });

  /**
   * @target `decodeCardanoAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      decodeCardanoAddress(testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('validateCardanoAddress', () => {
  /**
   * @target `validateCardanoAddress` should validate Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Cardano address
   */
  it('should validate Cardano address successfully', () => {
    expect(() => {
      validateCardanoAddress(testData.cardanoAddress);
    }).not.toThrow();
  });

  /**
   * @target `validateCardanoAddress` should throw error for wrong Cardano address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Cardano address
   */
  it('should throw error for wrong Cardano address', () => {
    expect(() => {
      validateCardanoAddress(testData.invalidCardanoAddress);
    }).toThrow();
  });
});
