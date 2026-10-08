import * as wasm from 'ergo-lib-wasm-nodejs';

import { ERGO_CHAIN } from './const';
import { UnsupportedAddressError } from './types';

/**
 * parses an Ergo address, rejecting the ones this codec cannot represent
 *  the stored bytes are only the address content bytes, and decoding
 *  always rebuilds a mainnet P2PK address from them, so a testnet or
 *  non-P2PK address would silently decode into a different address (or
 *  fail to decode at all); such addresses are refused here instead
 * @param address
 */
const parseRepresentableErgoAddress = (address: string): wasm.Address => {
  const parsed = wasm.Address.from_base58(address);
  try {
    wasm.Address.from_mainnet_str(address);
  } catch {
    throw new UnsupportedAddressError(
      ERGO_CHAIN,
      address,
      'only mainnet addresses are supported',
    );
  }
  if (parsed.address_type_prefix() !== wasm.AddressTypePrefix.P2Pk)
    throw new UnsupportedAddressError(
      ERGO_CHAIN,
      address,
      'only P2PK addresses are supported',
    );
  return parsed;
};

/**
 * encodes address of Ergo chain to hex string
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const encodeErgoAddress = (address: string): string => {
  const encoded = Buffer.from(
    parseRepresentableErgoAddress(address).content_bytes(),
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
  parseRepresentableErgoAddress(address);
};
