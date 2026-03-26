import * as bitcoinLib from 'bitcoinjs-lib';

import { DOGE_CHAIN } from './const';
import { UnsupportedAddressError } from './types';

export const DOGE_NETWORK = {
  // Doge network parameters
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'dc',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
};

/**
 * encodes address of Doge chain to hex string
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const encodeDogeAddress = (address: string): string => {
  const encoded = bitcoinLib.address
    .toOutputScript(address, DOGE_NETWORK)
    .toString('hex');
  if (encoded.length > 60 * 2)
    throw new UnsupportedAddressError(DOGE_CHAIN, address);
  return encoded;
};

/**
 * decodes address of Doge chain
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const decodeDogeAddress = (encodedAddress: string): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(DOGE_CHAIN, encodedAddress);
  return bitcoinLib.address.fromOutputScript(
    Buffer.from(encodedAddress, 'hex'),
    DOGE_NETWORK,
  );
};

/**
 * validates address of Doge chain
 * @param address
 */
export const validateDogeAddress = (address: string): void => {
  bitcoinLib.address.toOutputScript(address, DOGE_NETWORK);
};
