import * as ethers from 'ethers';

import { UnsupportedAddressError } from '../types';

/**
 * generates address encoder for an EVM
 * @param chain
 */
export const generateEvmAddressEncoder =
  (chain: string) =>
  (address: string): string => {
    if (address.length !== 42)
      throw new UnsupportedAddressError(
        chain,
        address,
        'EVM addresses expected to be 20 bytes long',
      );
    if (address.substring(0, 2) !== '0x')
      throw new UnsupportedAddressError(
        chain,
        address,
        "EVM addresses expected to start with '0x'",
      );
    const encoded = address.substring(2);
    if (encoded.length > 60 * 2)
      throw new UnsupportedAddressError(
        chain,
        address,
        'Encoded address is longer than 60 bytes',
      );
    return encoded;
  };

/**
 * generates address decoder for an EVM chain
 * @param chain
 */
export const generateEvmAddressDecoder =
  (chain: string) =>
  (encodedAddress: string): string => {
    if (encodedAddress.length !== 40) {
      throw new UnsupportedAddressError(
        chain,
        encodedAddress,
        'EVM encoded addresses expected to be 20 bytes long',
      );
    }

    return '0x' + encodedAddress;
  };

/**
 * generates address validator for an EVM chain
 * @param chain
 */
export const generateEvmAddressValidator =
  (chain: string) =>
  (address: string): void => {
    if (address.toLowerCase() !== address)
      throw new UnsupportedAddressError(
        chain,
        address,
        'EVM addresses expected to be lowercase',
      );
    if (!ethers.isAddress(address))
      throw new UnsupportedAddressError(
        chain,
        address,
        "Failed to validate the address using 'ethers'",
      );
  };
