import { AddressManager } from '../lib';

export class TestAddressManager extends AddressManager {
  constructor(
    chainValidators: Record<string, (address: string) => void>,
    chainDecoders: Record<string, (encodedAddress: string) => string>,
  ) {
    super(chainValidators, chainDecoders);
  }

  /**
   * validates address of a chain
   * @param chain
   * @param address
   */
  validateAddress = (chain: string, address: string): void => {
    const validator = this.chainValidators[chain];
    if (validator) validator(address);
    throw Error(
      `No address validator is set for chain [${chain}] in AddressManager`,
    );
  };

  /**
   * decodes address of a chain
   * @param chain
   * @param address
   */
  decodeAddress = (chain: string, address: string): string => {
    const decoder = this.chainDecoders[chain];
    if (decoder) return decoder(address);
    throw Error(
      `No address decoder is set for chain [${chain}] in AddressManager`,
    );
  };
}
