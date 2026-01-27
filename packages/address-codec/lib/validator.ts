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
import * as ethereumLib from 'ethers';

/**
 * validates address of a chain
 * @param chain
 * @param address
 */
export const validateAddress = (chain: string, address: string): boolean => {
  switch (chain) {
    case ERGO_CHAIN:
      ergoLib.Address.from_base58(address);
      return true;
    case CARDANO_CHAIN:
      cardanoLib.Address.from_bech32(address);
      return true;
    case BITCOIN_CHAIN:
      bitcoinLib.address.fromBech32(address);
      if (address.slice(0, 4) != 'bc1q')
        throw new UnsupportedAddressError(chain, address);
      return true;
    case BINANCE_CHAIN:
    case ETHEREUM_CHAIN:
      if (address.toLowerCase() != address || !ethereumLib.isAddress(address))
        throw new UnsupportedAddressError(chain, address);
      return true;
    case DOGE_CHAIN:
      try {
        bitcoinLib.address.toOutputScript(address, DOGE_NETWORK);
      } catch {
        throw new UnsupportedAddressError(chain, address);
      }
      return true;
    case RUNES_CHAIN:
      try {
        bitcoinLib.address.toOutputScript(address);
        if (address.slice(0, 4) != 'bc1p')
          throw new UnsupportedAddressError(chain, address);
      } catch {
        throw new UnsupportedAddressError(chain, address);
      }
      return true;
    case FIRO_CHAIN:
      try {
        bitcoinLib.address.toOutputScript(address, FIRO_NETWORK);
      } catch {
        throw new UnsupportedAddressError(chain, address);
      }
      return true;
    default:
      throw new UnsupportedChainError(chain);
  }
};
