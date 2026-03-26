import * as bitcoinLib from 'bitcoinjs-lib';

import { FIRO_CHAIN } from './const';
import { UnsupportedAddressError } from './types';

export const FIRO_NETWORK = {
  // Firo network parameters
  messagePrefix: '\x19Firo Signed Message:\n',
  bech32: 'firo',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x52,
  scriptHash: 0x07,
  wif: 0xd2,
};

/**
 * encodes address of Firo chain to hex string
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const encodeFiroAddress = (address: string): string => {
  const encoded = bitcoinLib.address
    .toOutputScript(address, FIRO_NETWORK)
    .toString('hex');
  if (encoded.length > 60 * 2)
    throw new UnsupportedAddressError(FIRO_CHAIN, address);
  return encoded;
};

/**
 * decodes address of Firo chain
 *  throws error if encoded address length is more than 60 bytes
 * @param address
 */
export const decodeFiroAddress = (encodedAddress: string): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(FIRO_CHAIN, encodedAddress);
  return bitcoinLib.address.fromOutputScript(
    Buffer.from(encodedAddress, 'hex'),
    FIRO_NETWORK,
  );
};

/**
 * validates address of Firo chain
 * @param address
 */
export const validateFiroAddress = (address: string): void => {
  bitcoinLib.address.toOutputScript(address, FIRO_NETWORK);
};
