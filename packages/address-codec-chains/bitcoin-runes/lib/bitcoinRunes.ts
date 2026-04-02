import * as bitcoinLib from 'bitcoinjs-lib';

import { BITCOIN_RUNES_CHAIN } from './const';
import { UnsupportedAddressError } from './types';

/**
 * encodes address of Bitcoin chain to hex string
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const encodeBitcoinRunesAddress = (address: string): string => {
  const encoded = bitcoinLib.address.toOutputScript(address).toString('hex');
  if (encoded.length > 60 * 2)
    throw new UnsupportedAddressError(BITCOIN_RUNES_CHAIN, address);
  return encoded;
};

/**
 * decodes address of Bitcoin chain
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const decodeBitcoinRunesAddress = (encodedAddress: string): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(BITCOIN_RUNES_CHAIN, encodedAddress);
  return bitcoinLib.address.fromOutputScript(
    Buffer.from(encodedAddress, 'hex'),
  );
};

/**
 * validates address of Bitcoin chain (Acceptable for Bitcoin Runes events)
 * @param address
 */
export const validateBitcoinRunesAddress = (address: string): void => {
  if (address.slice(0, 4) !== 'bc1p')
    throw new UnsupportedAddressError(BITCOIN_RUNES_CHAIN, address);
  bitcoinLib.address.fromBech32(address);
};
