import * as testData from './testData';
import {
  UnsupportedAddressError,
  UnsupportedChainError,
  validateAddress,
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
   * @target `validateAddress` should throw error for wrong Ergo address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Ergo address
   */
  it('should throw error for wrong Ergo address', () => {
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
   * @target `validateAddress` should throw error for wrong Cardano address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Cardano address
   */
  it('should throw error for wrong Cardano address', () => {
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
   * @target `validateAddress` should throw error for Bitcoin taproot address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for Bitcoin taproot address
   */
  it('should throw error for Bitcoin taproot address', () => {
    expect(() => {
      validateAddress(BITCOIN_CHAIN, testData.taprootBitcoinAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should throw error for wrong Bitcoin address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Bitcoin address
   */
  it('should throw error for wrong Bitcoin address', () => {
    expect(() => {
      validateAddress(BITCOIN_CHAIN, testData.invalidBitcoinAddress);
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
   * @target `validateAddress` should throw error for ICAP Ethereum address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for ICAP Ethereum address
   */
  it('should throw error for ICAP Ethereum address', () => {
    expect(() => {
      validateAddress(ETHEREUM_CHAIN, testData.invalidEthereumIcapAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should throw error for Ethereum address with checksum
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for Ethereum address with checksum
   */
  it('should throw error for Ethereum address with checksum', () => {
    expect(() => {
      validateAddress(ETHEREUM_CHAIN, testData.invalidEthereumChecksumAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should throw error for wrong Ethereum address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Ethereum address
   */
  it('should throw error for wrong Ethereum address', () => {
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

  /**
   * @target `validateAddress` should validate Doge address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Doge address
   */
  it('should validate Doge address successfully', () => {
    const res = validateAddress(DOGE_CHAIN, testData.dogeAddress);
    expect(res).toEqual(true);
  });

  /**
   * @target `validateAddress` should throw error for wrong Doge address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Doge address
   */
  it('should throw error for wrong Doge address', () => {
    expect(() => {
      validateAddress(DOGE_CHAIN, testData.invalidDogeAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should validate Runes address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Runes address
   */
  it('should validate Runes address successfully', () => {
    const res = validateAddress(RUNES_CHAIN, testData.taprootBitcoinAddress);
    expect(res).toEqual(true);
  });

  /**
   * @target `validateAddress` should throw error for wrong Runes address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Runes address
   */
  it('should throw error for wrong Runes address', () => {
    expect(() => {
      validateAddress(RUNES_CHAIN, testData.bitcoinAddress);
    }).toThrow(UnsupportedAddressError);
  });

  /**
   * @target `validateAddress` should validate Firo address successfully
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to validate correct Firo address
   */
  it('should validate Firo address successfully', () => {
    const res = validateAddress(FIRO_CHAIN, testData.firoAddress);
    expect(res).toEqual(true);
  });

  /**
   * @target `validateAddress` should throw error for wrong Firo address
   * @dependencies
   * @scenario
   * - run test
   * @expected
   * - to throw error for wrong Firo address
   */
  it('should throw error for wrong Firo address', () => {
    expect(() => {
      validateAddress(FIRO_CHAIN, testData.invalidFiroAddress);
    }).toThrow(UnsupportedAddressError);
  });
});
