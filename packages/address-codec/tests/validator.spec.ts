import * as testData from './testData';
import {
  UnsupportedAddressError,
  UnsupportedChainError,
  validateAddress,
} from '../lib';
import {
  BITCOIN_CHAIN,
  CARDANO_CHAIN,
  ERGO_CHAIN,
  ETHEREUM_CHAIN,
} from '../lib/const';

describe('validateAddress', () => {
  /**
   * @target `validateAddress` should validate Ergo address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Ergo address
   */
  it('should validate Ergo address successfully', () => {
    const res = validateAddress(ERGO_CHAIN, testData.ergoAddress);
    expect(res).toEqual(true);
  });

  /**
   * @target `validateAddress` should not validate wrong Ergo address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - not to validate wrong Ergo address
   */
  it('should not validate wrong Ergo address', () => {
    expect(() => {
      validateAddress(ERGO_CHAIN, testData.invalidErgoAddress);
    }).toThrow();
  });

  /**
   * @target `validateAddress` should validate Cardano address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Cardano address
   */
  it('should validate Cardano address successfully', () => {
    const res = validateAddress(CARDANO_CHAIN, testData.cardanoAddress);
    expect(res).toEqual(true);
  });

  /**
   * @target `validateAddress` should not validate wrong Cardano address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - not to validate wrong Cardano address
   */
  it('should not validate wrong Cardano address', () => {
    expect(() => {
      validateAddress(CARDANO_CHAIN, testData.invalidCardanoAddress);
    }).toThrow();
  });

  /**
   * @target `validateAddress` should validate Bitcoin address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Bitcoin address
   */
  it('should validate Bitcoin address successfully', () => {
    const res = validateAddress(BITCOIN_CHAIN, testData.bitcoinAddress);
    expect(res).toEqual(true);
  });

  /**
   * @target `validateAddress` should not validate Bitcoin taproot address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - not to validate Bitcoin taproot address
   */
  it('should not validate Bitcoin taproot address', () => {
    expect(() => {
      validateAddress(BITCOIN_CHAIN, testData.tapRootBitcoinAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should not validate wrong Bitcoin address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - not to validate wrong Bitcoin address
   */
  it('should not validate wrong Bitcoin address', () => {
    expect(() => {
      validateAddress(BITCOIN_CHAIN, testData.invalidBitcoinAddressLength);
    }).toThrowError();
  });

  /**
   * @target `validateAddress` should validate Ethereum address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Ethereum address
   */
  it('should validate Ethereum address successfully', () => {
    const res = validateAddress(ETHEREUM_CHAIN, testData.ethereumAddress);
    expect(res).toEqual(true);
  });

  /**
   * @target `validateAddress` should not validate ICAP Ethereum address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - not to validate ICAP Ethereum address
   */
  it('should not validate ICAP Ethereum address', () => {
    expect(() => {
      validateAddress(ETHEREUM_CHAIN, testData.invalidEthereumIcapAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should not validate Ethereum address with checksum
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - not to validate Ethereum address with checksum
   */
  it('should not validate Ethereum address with checksum', () => {
    expect(() => {
      validateAddress(ETHEREUM_CHAIN, testData.invalidEthereumChecksumAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should not validate wrong Ethereum address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - not to validate wrong Ethereum address
   */
  it('should not validate wrong Ethereum address', () => {
    expect(() => {
      validateAddress(ETHEREUM_CHAIN, testData.invalidEthereumAddressLength);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should throw error when chain is not supported
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - it should throw UnsupportedChain error
   */
  it('should throw error when chain is not supported', () => {
    expect(() => {
      validateAddress('unsupported-chain', '0011223344');
    }).toThrow(UnsupportedChainError);
  });
});
