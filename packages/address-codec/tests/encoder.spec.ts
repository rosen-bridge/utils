import { UnsupportedChainError, encodeAddress } from '../lib';
import { BASE_CHAIN } from '../lib/const';

describe('encodeAddress', () => {
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

  it('should encode base addresses using the shared EVM encoder', () => {
    expect(
      encodeAddress(BASE_CHAIN, '0x4200000000000000000000000000000000000006'),
    ).toBe('4200000000000000000000000000000000000006');
  });
});
