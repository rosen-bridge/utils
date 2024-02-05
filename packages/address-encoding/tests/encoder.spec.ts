import * as testData from './testData';
import { UnsupportedAddress, UnsupportedChain, addressEncoder } from '../lib';
import { BITCOIN_CHAIN, CARDANO_CHAIN, ERGO_CHAIN } from '../lib/const';

describe('addressEncoder', () => {
  /**
   * @target `addressEncoder` should encode Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be public key of given address in hex
   */
  it('should encode Ergo address successfully', () => {
    const res = addressEncoder(ERGO_CHAIN, testData.ergoAddress);
    expect(res).toEqual(testData.encodedErgoAddress);
  });

  /**
   * @target `addressEncoder` should encode Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be public key of given address in hex
   */
  it('should encode Cardano address successfully', () => {
    const res = addressEncoder(CARDANO_CHAIN, testData.cardanoAddress);
    expect(res).toEqual(testData.encodedCardanoAddress);
  });

  /**
   * @target `addressEncoder` should encode Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be output script of given address in hex
   */
  it('should encode Bitcoin address successfully', () => {
    const res = addressEncoder(BITCOIN_CHAIN, testData.bitcoinAddress);
    expect(res).toEqual(testData.encodedBitcoinAddress);
  });

  /**
   * @target `addressEncoder` should throw error when encoded address is more than 57 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 57 bytes', () => {
    expect(() => {
      addressEncoder(ERGO_CHAIN, testData.longErgoAddress);
    }).toThrow(UnsupportedAddress);
  });

  /**
   * @target `addressEncoder` should throw error when chain is not supported
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedChain error
   */
  it('should throw error when chain is not supported', () => {
    expect(() => {
      addressEncoder('unsupported-chain', 'address');
    }).toThrow(UnsupportedChain);
  });
});
