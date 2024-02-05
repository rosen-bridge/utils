import { BITCOIN_CHAIN, CARDANO_CHAIN, ERGO_CHAIN } from './const';
import { UnsupportedAddress, UnsupportedChain } from './types';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import * as cardanoLib from '@emurgo/cardano-serialization-lib-nodejs';
import * as bitcoinLib from 'bitcoinjs-lib';

/**
 * decodes address of a chain
 *  encodedAddress length cannot be more than 57 bytes
 * @param chain
 * @param encodedAddress
 */
export const addressDecoder = (
  chain: string,
  encodedAddress: string
): string => {
  if (encodedAddress.length > 57 * 2)
    throw new UnsupportedAddress(chain, encodedAddress);
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
    default:
      throw new UnsupportedChain(chain);
  }
};
