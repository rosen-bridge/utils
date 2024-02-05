import * as testData from './testData';
import {
  UnsupportedAddressError,
  UnsupportedChainError,
  encodeAddress,
} from '../lib';
import { BITCOIN_CHAIN, CARDANO_CHAIN, ERGO_CHAIN } from '../lib/const';

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
   * @target `encodeAddress` should throw error when encoded address is more than 57 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 57 bytes', () => {
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
