import { decodeAddress, encodeAddress, validateAddress } from '../lib';

const address = 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a';
const script = '76a91476a04053bda0a88bda5177b86a15c3b29f55987388ac';

describe('Bitcoin Cash dispatch', () => {
  /**
   * @target Address dispatch should join the distinct BCH codec functions
   * @dependencies
   * - The real address dispatcher, BCH codec and canonical address fixture
   * @scenario
   * - Encode, decode and validate as BCH, then validate as Bitcoin
   * @expected
   * - BCH round-trips exactly; the Bitcoin route rejects the BCH address
   */
  it('joins encoding, decoding and validation under the distinct BCH chain', () => {
    expect(encodeAddress('bitcoin-cash', address)).toEqual(script);
    expect(decodeAddress('bitcoin-cash', script)).toEqual(address);
    expect(() => validateAddress('bitcoin-cash', address)).not.toThrow();
    expect(() => validateAddress('bitcoin', address)).toThrow();
  });

  /**
   * @target Address dispatch should preserve native BCH validation limits
   * @dependencies
   * - The real address dispatcher and BCH codec; no mocks
   * @scenario
   * - Supply a prefixless address, legacy address and extended script
   * @expected
   * - Validation, encoding and decoding reject their respective inputs
   */
  it('preserves native-only validation through generic dispatch', () => {
    expect(() =>
      validateAddress('bitcoin-cash', address.split(':')[1]),
    ).toThrow();
    expect(() =>
      encodeAddress('bitcoin-cash', '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu'),
    ).toThrow();
    expect(() => decodeAddress('bitcoin-cash', script + '00')).toThrow();
  });
});
