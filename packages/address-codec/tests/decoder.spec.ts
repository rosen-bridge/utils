import { UnsupportedChainError, decodeAddress } from '../lib';
import { BASE_CHAIN } from '../lib/const';

describe('decodeAddress', () => {
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

  it('should decode base addresses using the shared EVM decoder', () => {
    expect(
      decodeAddress(BASE_CHAIN, '4200000000000000000000000000000000000006'),
    ).toBe('0x4200000000000000000000000000000000000006');
  });
});
