import { UnsupportedChainError, decodeAddress } from '../lib';

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
});
