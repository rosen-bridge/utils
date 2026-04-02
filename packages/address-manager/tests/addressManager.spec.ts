import { TestAddressManager } from './testAddressManager';

describe('AddressManager', () => {
  describe('validateAddress', () => {
    /**
     * @target `AddressManager.validateAddress` should validate the address successfully when the validator is registered for the chain
     * @dependencies
     * @scenario
     * - create AddressManager with validator for the chain
     * - run test
     * - check if any exception is thrown
     * @expected
     * - no errors should be thrown
     */
    it('should validate the address successfully when the validator is registered for the chain', () => {
      const addressManager = new TestAddressManager(
        {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          chain: (address: string) => {},
        },
        {},
      );
      expect(() => {
        addressManager.validateAddress('chain', 'address');
      }).not.toThrow();
    });

    /**
     * @target `AddressManager.validateAddress` should throw error when no validator is registered for the chain
     * @dependencies
     * @scenario
     * - create AddressManager with validator for another chain
     * - run test & check thrown exception
     * @expected
     * - it should throw Error
     */
    it('should throw error when no validator is registered for the chain', () => {
      const addressManager = new TestAddressManager(
        {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          anotherChain: (address: string) => {},
        },
        {},
      );
      expect(() => {
        addressManager.validateAddress('chain', 'address');
      }).toThrow(Error);
    });
  });

  describe('decodeAddress', () => {
    /**
     * @target `AddressManager.decodeAddress` should decode the address successfully when the decoder is registered for the chain
     * @dependencies
     * @scenario
     * - create AddressManager with decoder for the chain
     * - run test
     * - check returned value
     * @expected
     * - it should return the decoded address
     */
    it('should decode the address successfully when the decoder is registered for the chain', () => {
      const addressManager = new TestAddressManager(
        {},
        {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          chain: (address: string) => 'decoded-address',
        },
      );
      const res = addressManager.decodeAddress('chain', 'encoded-address');
      expect(res).toEqual('decoded-address');
    });

    /**
     * @target `AddressManager.decodeAddress` should throw error when no decoder is registered for the chain
     * @dependencies
     * @scenario
     * - create AddressManager with decoder for another chain
     * - run test & check thrown exception
     * @expected
     * - it should throw Error
     */
    it('should throw error when no decoder is registered for the chain', () => {
      const addressManager = new TestAddressManager(
        {},
        {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          anotherChain: (address: string) => 'decoded-address',
        },
      );
      expect(() => {
        addressManager.decodeAddress('chain', 'encoded-address');
      }).toThrow(Error);
    });
  });
});
