import * as bitcoinLib from 'bitcoinjs-lib';

import { HANDSHAKE_CHAIN } from '../const';
import { UnsupportedAddressError } from '../types';

export const HANDSHAKE_NETWORK = {
  // Handshake network parameters
  messagePrefix: '\x18Handshake Signed Message:\n',
  bech32: 'hs',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: -1,
  scriptHash: -1,
  wif: -1,
};

/**
 * encodes address of Handshake chain to hex string
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const encodeHandshakeAddress = (address: string): string => {
  const encoded = bitcoinLib.address
    .toOutputScript(address, HANDSHAKE_NETWORK)
    .toString('hex');
  if (encoded.length > 60 * 2)
    throw new UnsupportedAddressError(HANDSHAKE_CHAIN, address);
  return encoded;
};

/**
 * decodes address of Handshake chain
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const decodeHandshakeAddress = (encodedAddress: string): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(HANDSHAKE_CHAIN, encodedAddress);
  return bitcoinLib.address.fromOutputScript(
    Buffer.from(encodedAddress, 'hex'),
    HANDSHAKE_NETWORK,
  );
};

/**
 * validates address of Handshake chain
 * @param address
 */
export const validateHandshakeAddress = (address: string): void => {
  bitcoinLib.address.toOutputScript(address, HANDSHAKE_NETWORK);
};
