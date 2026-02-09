import { addressToHash } from '../../../lib/getRosenData/handshake/utils';

describe('addressToHash', () => {
  /**
   * @target `addressToHash` should extract hash from Handshake address successfully
   * @dependencies
   * @scenario
   * - mock valid Handshake address
   * - run test
   * - check returned value
   * @expected
   * - it should return expected address hash hex
   */
  it('should extract hash from Handshake address successfully', () => {
    const address = 'hs1qvq4029zf8zvms3pw6t9znju5wqte3hpykr8q3s';

    const result = addressToHash(address);

    expect(result).toBe('602af514493899b8442ed2ca29cb94701798dc24');
  });

  /**
   * @target `addressToHash` should extract hash from another Handshake address
   * @dependencies
   * @scenario
   * - mock valid Handshake address
   * - run test
   * - check returned value
   * @expected
   * - it should return expected address hash hex
   */
  it('should extract hash from another Handshake address', () => {
    const address = 'hs1qrk5xfaxdk4mhem8rljr5k0yvkaxn6vzvh7mh04';

    const result = addressToHash(address);

    expect(result).toBe('1da864f4cdb5777cece3fc874b3c8cb74d3d304c');
  });
});
