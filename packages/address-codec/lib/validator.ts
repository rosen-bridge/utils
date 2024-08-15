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
    case ETHEREUM_CHAIN:
      if (address.toLowerCase() != address || !ethereumLib.isAddress(address))
        throw new UnsupportedAddressError(chain, address);
      return true;
    default:
      throw new UnsupportedChainError(chain);
  }
};
