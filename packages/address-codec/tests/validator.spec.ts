import { UnsupportedChainError, validateAddress } from '../lib';
import { BASE_CHAIN } from '../lib/const';

describe('validateAddress', () => {
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

  it('should validate base addresses using the shared EVM validator', () => {
    expect(() => {
      validateAddress(BASE_CHAIN, '0x4200000000000000000000000000000000000006');
    }).not.toThrow();
  });
});
