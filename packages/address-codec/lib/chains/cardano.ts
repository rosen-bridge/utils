import * as csl from '@emurgo/cardano-serialization-lib-nodejs';

import { CARDANO_CHAIN } from '../const';
import { UnsupportedAddressError } from '../types';

/**
 * encodes address of Cardano chain to hex string
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const encodeCardanoAddress = (address: string): string => {
  const encoded = Buffer.from(
    csl.Address.from_bech32(address).to_bytes(),
  ).toString('hex');
  if (encoded.length > 60 * 2)
    throw new UnsupportedAddressError(CARDANO_CHAIN, address);
  return encoded;
};

/**
 * decodes address of Cardano chain
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const decodeCardanoAddress = (encodedAddress: string): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(CARDANO_CHAIN, encodedAddress);
  return csl.Address.from_bytes(
    Uint8Array.from(Buffer.from(encodedAddress, 'hex')),
  ).to_bech32();
};

/**
 * validates address of Cardano chain
 * @param address
 */
export const validateCardanoAddress = (address: string): void => {
  csl.Address.from_bech32(address);
};
