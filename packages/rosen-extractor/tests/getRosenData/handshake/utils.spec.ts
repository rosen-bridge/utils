import {
  parseRosenData,
  addressToHash,
} from '../../../lib/getRosenData/handshake/utils';

describe('Handshake utils', () => {
  describe('parseRosenData', () => {
    /**
     * @target `parseRosenData` should parse rosen data from UPDATE covenant successfully
     * @dependencies
     * @scenario
     * - mock valid rosen data hex (from UPDATE covenant.items[2])
     * - run test
     * - check returned value
     * @expected
     * - it should return expected rosen data
     */
    it('should parse rosen data from Handshake address hash successfully', () => {
      const dataHex =
        '000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36';

      const result = parseRosenData(dataHex);

      expect(result).toStrictEqual({
        toChain: 'ergo',
        toAddress: '9iCzESRfvKU6Axyt3BnBuVrYW3ZYj3knPF95STzrjaRrjtTcj9R',
        bridgeFee: '100000000',
        networkFee: '10000000',
      });
    });

    /**
     * @target `parseRosenData` should throw error when toChain code is invalid
     * @dependencies
     * @scenario
     * - mock data with invalid chain code
     * - run test
     * - check if error is thrown
     * @expected
     * - it should throw an error
     */
    it('should throw error when toChain code is invalid', () => {
      const invalidData =
        '090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36';

      expect(() => parseRosenData(invalidData)).toThrow('invalid toChain code');
    });
  });

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
});
