import * as testData from './testData';
import { UnsupportedAddress, UnsupportedChain, addressDecoder } from '../lib';
import { BITCOIN_CHAIN, CARDANO_CHAIN, ERGO_CHAIN } from '../lib/const';

describe('addressDecoder', () => {
  /**
   * @target `addressDecoder` should decode Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in base58 format
   */
  it('should decode Ergo address successfully', () => {
    const res = addressDecoder(ERGO_CHAIN, testData.encodedErgoAddress);
    expect(res).toEqual(testData.ergoAddress);
  });

  /**
   * @target `addressDecoder` should decode Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Cardano address successfully', () => {
    const res = addressDecoder(CARDANO_CHAIN, testData.encodedCardanoAddress);
    expect(res).toEqual(testData.cardanoAddress);
  });

  /**
   * @target `addressDecoder` should decode Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Bitcoin address successfully', () => {
    const res = addressDecoder(BITCOIN_CHAIN, testData.encodedBitcoinAddress);
    expect(res).toEqual(testData.bitcoinAddress);
  });

  /**
   * @target `addressDecoder` should throw error when encoded address is more than 57 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 57 bytes', () => {
    expect(() => {
      addressDecoder(ERGO_CHAIN, testData.longEncodedAddress);
    }).toThrow(UnsupportedAddress);
  });

  /**
   * @target `addressDecoder` should throw error when chain is not supported
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedChain error
   */
  it('should throw error when chain is not supported', () => {
    expect(() => {
      addressDecoder('unsupported-chain', '0011223344');
    }).toThrow(UnsupportedChain);
  });
});
