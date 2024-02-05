import { BITCOIN_CHAIN, CARDANO_CHAIN, ERGO_CHAIN } from './const';
import { UnsupportedAddressError, UnsupportedChainError } from './types';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import * as cardanoLib from '@emurgo/cardano-serialization-lib-nodejs';
import * as bitcoinLib from 'bitcoinjs-lib';

/**
 * encodes address of a chain to hex string
 *  throws error if encoded address length is more than 57 bytes
 * @param chain
 * @param address
 */
export const encodeAddress = (chain: string, address: string): string => {
  let encoded: string;
  switch (chain) {
    case ERGO_CHAIN:
      encoded = Buffer.from(
        ergoLib.Address.from_base58(address).content_bytes()
      ).toString('hex');
      break;
    case CARDANO_CHAIN:
      encoded = Buffer.from(
        cardanoLib.Address.from_bech32(address).to_bytes()
      ).toString('hex');
      break;
    case BITCOIN_CHAIN:
      encoded = Buffer.from(
        bitcoinLib.address.toOutputScript(address)
      ).toString('hex');
      break;
    default:
      throw new UnsupportedChainError(chain);
  }
  if (encoded.length > 57 * 2)
    throw new UnsupportedAddressError(chain, address);
  return encoded;
};
