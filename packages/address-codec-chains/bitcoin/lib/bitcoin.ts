import * as bitcoinLib from 'bitcoinjs-lib';

import { BITCOIN_CHAIN } from './const';
import { UnsupportedAddressError } from './types';

/**
 * encodes address of Bitcoin chain to hex string
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const encodeBitcoinAddress = (address: string): string => {
  const encoded = bitcoinLib.address.toOutputScript(address).toString('hex');
  if (encoded.length > 60 * 2)
    throw new UnsupportedAddressError(BITCOIN_CHAIN, address);
  return encoded;
};

/**
 * decodes address of Bitcoin chain
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const decodeBitcoinAddress = (encodedAddress: string): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(BITCOIN_CHAIN, encodedAddress);
  return bitcoinLib.address.fromOutputScript(
    Buffer.from(encodedAddress, 'hex'),
  );
};

/**
 * validates address of Bitcoin chain
 * @param address
 */
export const validateBitcoinAddress = (address: string): void => {
  if (address.slice(0, 4) !== 'bc1q')
    throw new UnsupportedAddressError(BITCOIN_CHAIN, address);
  bitcoinLib.address.fromBech32(address);
};
