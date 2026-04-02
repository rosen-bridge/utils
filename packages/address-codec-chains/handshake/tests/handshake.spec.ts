import {
  decodeHandshakeAddress,
  encodeHandshakeAddress,
  UnsupportedAddressError,
  validateHandshakeAddress,
} from '../lib';
import * as testData from './testData';

describe('encodeHandshakeAddress', () => {
  /**
   * @target `encodeHandshakeAddress` should encode Handshake address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should encode Handshake address successfully', () => {
    const res = encodeHandshakeAddress(testData.handshakeAddress);
    expect(res).toEqual(testData.encodedHandshakeAddress);
  });
});

describe('decodeHandshakeAddress', () => {
  /**
   * @target `decodeHandshakeAddress` should decode Handshake address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Handshake address successfully', () => {
    const res = decodeHandshakeAddress(testData.encodedHandshakeAddress);
    expect(res).toEqual(testData.handshakeAddress);
  });

  /**
   * @target `decodeHandshakeAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      decodeHandshakeAddress(testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('validateHandshakeAddress', () => {
  /**
   * @target `validateHandshakeAddress` should validate Handshake address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Handshake address
   */
  it('should validate Handshake address successfully', () => {
    expect(() => {
      validateHandshakeAddress(testData.handshakeAddress);
    }).not.toThrow();
  });

  /**
   * @target `validateHandshakeAddress` should throw error for wrong Handshake address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Handshake address
   */
  it('should throw error for wrong Handshake address', () => {
    expect(() => {
      validateHandshakeAddress(testData.invalidHandshakeAddress);
    }).toThrowError();
  });
});
