import {
  generateEvmAddressDecoder,
  generateEvmAddressEncoder,
  generateEvmAddressValidator,
  UnsupportedAddressError,
} from '../lib';
import * as testData from './testData';

describe('generateEvmAddressEncoder', () => {
  /**
   * @target `generateEvmAddressEncoder` should generate an encoder that encodes Ethereum address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should generate an encoder that encodes Ethereum address successfully', () => {
    const encodeAddress = generateEvmAddressEncoder('chain');
    const res = encodeAddress(testData.ethereumAddress);
    expect(res).toEqual(testData.encodedEthereumAddress);
  });

  /**
   * @target `generateEvmAddressEncoder` should generate an encoder that throws error when address is not 40 bytes
   * @dependencies
   * @scenario
   * - run test
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should generate an encoder that throws error when Ethereum address is not 40 bytes', () => {
    const encodeAddress = generateEvmAddressEncoder('chain');
    expect(() => {
      encodeAddress(testData.invalidEthereumAddressLength);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('generateEvmAddressDecoder', () => {
  /**
   * @target `generateEvmAddressDecoder` should generate a decoder that decodes Ethereum address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in hex format
   */
  it('should generate a decoder that decodes Ethereum address successfully', () => {
    const decodeAddress = generateEvmAddressDecoder('chain');
    const res = decodeAddress(testData.encodedEthereumAddress);
    expect(res).toEqual(testData.ethereumAddress);
  });

  /**
   * @target `generateEvmAddressDecoder` should generate a decoder that throws error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should generate a decoder that throws error when encoded address is more than 60 bytes', () => {
    const decodeAddress = generateEvmAddressDecoder('chain');
    expect(() => {
      decodeAddress(testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });
});

describe('generateEvmAddressValidator', () => {
  /**
   * @target `generateEvmAddressValidator` should generate a validator that validates Ethereum address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Ethereum address
   */
  it('should generate a validator that validates Ethereum address successfully', () => {
    const validateAddress = generateEvmAddressValidator('chain');
    expect(() => {
      validateAddress(testData.ethereumAddress);
    }).not.toThrow();
  });

  /**
   * @target `generateEvmAddressValidator` should generate a validator that throws error for ICAP Ethereum address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for ICAP Ethereum address
   */
  it('should generate a validator that throws error for ICAP Ethereum address', () => {
    const validateAddress = generateEvmAddressValidator('chain');
    expect(() => {
      validateAddress(testData.invalidEthereumIcapAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `generateEvmAddressValidator` should generate a validator that throws error for Ethereum address with checksum
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for Ethereum address with checksum
   */
  it('should generate a validator that throws error for Ethereum address with checksum', () => {
    const validateAddress = generateEvmAddressValidator('chain');
    expect(() => {
      validateAddress(testData.invalidEthereumChecksumAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `generateEvmAddressValidator` should generate a validator that throws error for wrong Ethereum address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Ethereum address
   */
  it('should generate a validator that throws error for wrong Ethereum address', () => {
    const validateAddress = generateEvmAddressValidator('chain');
    expect(() => {
      validateAddress(testData.invalidEthereumAddressLength);
    }).toThrow(UnsupportedAddressError);
  });
});
