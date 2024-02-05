import { BITCOIN_CHAIN, CARDANO_CHAIN, ERGO_CHAIN } from './const';
import { UnsupportedAddress, UnsupportedChain } from './types';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import * as cardanoLib from '@emurgo/cardano-serialization-lib-nodejs';
import * as bitcoinLib from 'bitcoinjs-lib';

/**
 * encodes address of a chain to hex string
 *  throws error if encoded address length is more than 57 bytes
 * @param chain
 * @param address
 */
export const addressEncoder = (chain: string, address: string): string => {
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
      encoded = bitcoinLib.address.fromBech32(address).data.toString('hex');
      break;
    default:
      throw new UnsupportedChain(chain);
  }
  if (encoded.length > 57 * 2) throw new UnsupportedAddress(chain, address);
  return encoded;
};
