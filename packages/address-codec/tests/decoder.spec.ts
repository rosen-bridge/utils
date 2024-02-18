import * as testData from './testData';
import {
  UnsupportedAddressError,
  UnsupportedChainError,
  decodeAddress,
} from '../lib';
import { BITCOIN_CHAIN, CARDANO_CHAIN, ERGO_CHAIN } from '../lib/const';

describe('decodeAddress', () => {
  /**
   * @target `decodeAddress` should decode Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in base58 format
   */
  it('should decode Ergo address successfully', () => {
    const res = decodeAddress(ERGO_CHAIN, testData.encodedErgoAddress);
    expect(res).toEqual(testData.ergoAddress);
  });

  /**
   * @target `decodeAddress` should decode Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Cardano address successfully', () => {
    const res = decodeAddress(CARDANO_CHAIN, testData.encodedCardanoAddress);
    expect(res).toEqual(testData.cardanoAddress);
  });

  /**
   * @target `decodeAddress` should decode Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in bech32 format
   */
  it('should decode Bitcoin address successfully', () => {
    const res = decodeAddress(BITCOIN_CHAIN, testData.encodedBitcoinAddress);
    expect(res).toEqual(testData.bitcoinAddress);
  });

  /**
   * @target `decodeAddress` should throw error when encoded address is more than 60 bytes
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedAddress error
   */
  it('should throw error when encoded address is more than 60 bytes', () => {
    expect(() => {
      decodeAddress(ERGO_CHAIN, testData.longEncodedAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `decodeAddress` should throw error when chain is not supported
   * @dependencies
   * @scenario
   * - run test & check thrown exception
   * @expected
   * - it should throw UnsupportedChain error
   */
  it('should throw error when chain is not supported', () => {
    expect(() => {
      decodeAddress('unsupported-chain', '0011223344');
    }).toThrow(UnsupportedChainError);
  });
});
