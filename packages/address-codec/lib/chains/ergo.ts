import * as wasm from 'ergo-lib-wasm-nodejs';

import { ERGO_CHAIN } from '../const';
import { UnsupportedAddressError } from '../types';

/**
 * encodes address of Ergo chain to hex string
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const encodeErgoAddress = (address: string): string => {
  const encoded = Buffer.from(
    wasm.Address.from_base58(address).content_bytes(),
  ).toString('hex');
  if (encoded.length > 60 * 2)
    throw new UnsupportedAddressError(ERGO_CHAIN, address);
  return encoded;
};

/**
 * decodes address of Ergo chain
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const decodeErgoAddress = (encodedAddress: string): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(ERGO_CHAIN, encodedAddress);
  return wasm.Address.from_public_key(
    Uint8Array.from(Buffer.from(encodedAddress, 'hex')),
  ).to_base58(wasm.NetworkPrefix.Mainnet);
};

/**
 * validates address of Ergo chain
 * @param address
 */
export const validateErgoAddress = (address: string): void => {
  wasm.Address.from_base58(address);
};
