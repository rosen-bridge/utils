import {
  BITCOIN_CHAIN,
  CARDANO_CHAIN,
  ERGO_CHAIN,
  ETHEREUM_CHAIN,
} from './const';
import { UnsupportedAddressError, UnsupportedChainError } from './types';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import * as cardanoLib from '@emurgo/cardano-serialization-lib-nodejs';
import * as bitcoinLib from 'bitcoinjs-lib';

/**
 * decodes address of a chain
 *  throws error if encoded address length is more than 60 bytes
 * @param chain
 * @param encodedAddress
 */
export const decodeAddress = (
  chain: string,
  encodedAddress: string
): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(chain, encodedAddress);
  switch (chain) {
    case ERGO_CHAIN:
      return ergoLib.Address.from_public_key(
        Buffer.from(encodedAddress, 'hex')
      ).to_base58(ergoLib.NetworkPrefix.Mainnet);
    case CARDANO_CHAIN:
      return cardanoLib.Address.from_bytes(
        Buffer.from(encodedAddress, 'hex')
      ).to_bech32();
    case BITCOIN_CHAIN:
      return bitcoinLib.address.fromOutputScript(
        Buffer.from(encodedAddress, 'hex')
      );
    case ETHEREUM_CHAIN:
      return encodedAddress;
    default:
      throw new UnsupportedChainError(chain);
  }
};
