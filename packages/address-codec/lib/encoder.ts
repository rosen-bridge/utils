import { encodeBitcoinAddress } from './chains/bitcoin';
import { encodeBitcoinRunesAddress } from './chains/bitcoinRunes';
import { encodeCardanoAddress } from './chains/cardano';
import { encodeDogeAddress } from './chains/doge';
import { encodeErgoAddress } from './chains/ergo';
import { generateEvmAddressEncoder } from './chains/evm';
import { encodeFiroAddress } from './chains/firo';
import { encodeHandshakeAddress } from './chains/handshake';
import {
  BINANCE_CHAIN,
  BITCOIN_CHAIN,
  CARDANO_CHAIN,
  DOGE_CHAIN,
  ERGO_CHAIN,
  ETHEREUM_CHAIN,
  HANDSHAKE_CHAIN,
  BITCOIN_RUNES_CHAIN,
  FIRO_CHAIN,
} from './const';
import { UnsupportedChainError } from './types';

export const chainEncoders: Record<string, (address: string) => string> = {
  [ERGO_CHAIN]: encodeErgoAddress,
  [CARDANO_CHAIN]: encodeCardanoAddress,
  [BITCOIN_CHAIN]: encodeBitcoinAddress,
  [ETHEREUM_CHAIN]: generateEvmAddressEncoder(ETHEREUM_CHAIN),
  [BINANCE_CHAIN]: generateEvmAddressEncoder(BINANCE_CHAIN),
  [DOGE_CHAIN]: encodeDogeAddress,
  [BITCOIN_RUNES_CHAIN]: encodeBitcoinRunesAddress,
  [FIRO_CHAIN]: encodeFiroAddress,
  [HANDSHAKE_CHAIN]: encodeHandshakeAddress,
};

/**
 * encodes address of a chain to hex string
 * @param chain
 * @param address
 */
export const encodeAddress = (chain: string, address: string): string => {
  const encoder = chainEncoders[chain];
  if (encoder) return encoder(address);
  throw new UnsupportedChainError(chain);
};
