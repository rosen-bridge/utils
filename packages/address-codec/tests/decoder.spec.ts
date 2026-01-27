import * as testData from './testData';
import {
  UnsupportedAddressError,
  UnsupportedChainError,
  decodeAddress,
} from '../lib';
import {
  BITCOIN_CHAIN,
  CARDANO_CHAIN,
  DOGE_CHAIN,
  ERGO_CHAIN,
  ETHEREUM_CHAIN,
  RUNES_CHAIN,
  FIRO_CHAIN,
} from '../lib/const';

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
   * @target `decodeAddress` should decode Ethereum address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in hex format
   */
  it('should decode Ethereum address successfully', () => {
    const res = decodeAddress(ETHEREUM_CHAIN, testData.encodedEthereumAddress);
    expect(res).toEqual(testData.ethereumAddress);
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

  /**
   * @target `decodeAddress` should decode Doge address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in hex format
   */
  it('should decode Doge address successfully', () => {
    const res = decodeAddress(DOGE_CHAIN, testData.encodedDogeAddress);
    expect(res).toEqual(testData.dogeAddress);
  });

  /**
   * @target `decodeAddress` should decode Runes address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in hex format
   */
  it('should decode Runes address successfully', () => {
    const res = decodeAddress(
      RUNES_CHAIN,
      testData.encodedTaprootBitcoinAddress,
    );
    expect(res).toEqual(testData.taprootBitcoinAddress);
  });

  /**
   * @target `decodeAddress` should decode Firo address successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned value
   * @expected
   * - it should be address in hex format
   */
  it('should decode Firo address successfully', () => {
    const res = decodeAddress(FIRO_CHAIN, testData.encodedFiroAddress);
    expect(res).toEqual(testData.firoAddress);
  });
});
