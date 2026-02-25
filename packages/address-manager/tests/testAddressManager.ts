import { AddressManager } from '../lib';

export class TestAddressManager extends AddressManager {
  constructor(
    chainValidators: Record<string, (address: string) => void>,
    chainDecoders: Record<string, (encodedAddress: string) => string>,
  ) {
    super(chainValidators, chainDecoders);
  }
}
