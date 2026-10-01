import { decodeAddress, encodeAddress, validateAddress } from '../lib';

const address = 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a';
const script = '76a91476a04053bda0a88bda5177b86a15c3b29f55987388ac';

describe('Bitcoin Cash dispatch', () => {
  it('joins encoding, decoding and validation under the distinct BCH chain', () => {
    expect(encodeAddress('bitcoin-cash', address)).toBe(script);
    expect(decodeAddress('bitcoin-cash', script)).toBe(address);
    expect(() => validateAddress('bitcoin-cash', address)).not.toThrow();
    expect(() => validateAddress('bitcoin', address)).toThrow();
  });

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
