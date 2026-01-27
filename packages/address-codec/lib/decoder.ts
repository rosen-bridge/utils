import {
  BINANCE_CHAIN,
  BITCOIN_CHAIN,
  CARDANO_CHAIN,
  DOGE_CHAIN,
  DOGE_NETWORK,
  ERGO_CHAIN,
  ETHEREUM_CHAIN,
  RUNES_CHAIN,
  FIRO_CHAIN,
  FIRO_NETWORK,
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
  encodedAddress: string,
): string => {
  if (encodedAddress.length > 60 * 2)
    throw new UnsupportedAddressError(chain, encodedAddress);
  switch (chain) {
    case ERGO_CHAIN:
      return ergoLib.Address.from_public_key(
        Uint8Array.from(Buffer.from(encodedAddress, 'hex')),
      ).to_base58(ergoLib.NetworkPrefix.Mainnet);
    case CARDANO_CHAIN:
      return cardanoLib.Address.from_bytes(
        Uint8Array.from(Buffer.from(encodedAddress, 'hex')),
      ).to_bech32();
    case RUNES_CHAIN:
    case BITCOIN_CHAIN:
      return bitcoinLib.address.fromOutputScript(
        Buffer.from(encodedAddress, 'hex'),
      );
    case BINANCE_CHAIN:
    case ETHEREUM_CHAIN:
      if (encodedAddress.length != 40) {
        throw new UnsupportedAddressError(chain, encodedAddress);
      }

      return '0x' + encodedAddress;
    case DOGE_CHAIN:
      return bitcoinLib.address.fromOutputScript(
        Buffer.from(encodedAddress, 'hex'),
        DOGE_NETWORK,
      );
    case FIRO_CHAIN:
      return bitcoinLib.address.fromOutputScript(
        Buffer.from(encodedAddress, 'hex'),
        FIRO_NETWORK,
      );
    default:
      throw new UnsupportedChainError(chain);
  }
};
