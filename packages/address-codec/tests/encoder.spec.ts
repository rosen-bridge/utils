import * as testData from './testData';
import {
  UnsupportedAddressError,
  UnsupportedChainError,
  encodeAddress,
} from '../lib';
import {
  BITCOIN_CHAIN,
  CARDANO_CHAIN,
  ERGO_CHAIN,
  ETHEREUM_CHAIN,
} from '../lib/const';

describe('encodeAddress', () => {
  /**
   * @target `encodeAddress` should encode Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be public key of given address in hex
   */
  it('should encode Ergo address successfully', () => {
    const res = encodeAddress(ERGO_CHAIN, testData.ergoAddress);
    expect(res).toEqual(testData.encodedErgoAddress);
  });

  /**
   * @target `encodeAddress` should encode Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be public key of given address in hex
   */
  it('should encode Cardano address successfully', () => {
    const res = encodeAddress(CARDANO_CHAIN, testData.cardanoAddress);
    expect(res).toEqual(testData.encodedCardanoAddress);
  });

  /**
   * @target `encodeAddress` should encode Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should encode Bitcoin address successfully', () => {
    const res = encodeAddress(BITCOIN_CHAIN, testData.bitcoinAddress);
    expect(res).toEqual(testData.encodedBitcoinAddress);
  });

  /**
   * @target `encodeAddress` should encode Ethereum address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should encode Ethereum address successfully', () => {
    const res = encodeAddress(ETHEREUM_CHAIN, testData.ethereumAddress);
    expect(res).toEqual(testData.encodedEthereumAddress);
  });

  /**
   * @target `encodeAddress` should throw  error when address is not 40 bytes
   * @dependencies
   * @scenario
   * - run test
   * - run test & check thrown exception
   * @expected
   * - it should throw  error when address is not 40 bytes
   */
  it('should encode Ethereum address successfully', () => {
    expect(() => {
      encodeAddress(ETHEREUM_CHAIN, testData.invalidEthereumAddressLength);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `encodeAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      encodeAddress(ERGO_CHAIN, testData.longErgoAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `encodeAddress` should throw error when chain is not supported
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedChain error
   */
  it('should throw error when chain is not supported', () => {
    expect(() => {
      encodeAddress('unsupported-chain', 'address');
    }).toThrow(UnsupportedChainError);
  });
});
