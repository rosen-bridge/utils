import { decodeBitcoinAddress } from './chains/bitcoin';
import { decodeBitcoinRunesAddress } from './chains/bitcoinRunes';
import { decodeCardanoAddress } from './chains/cardano';
import { decodeDogeAddress } from './chains/doge';
import { decodeErgoAddress } from './chains/ergo';
import { generateEvmAddressDecoder } from './chains/evm';
import { decodeFiroAddress } from './chains/firo';
import { decodeHandshakeAddress } from './chains/handshake';
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

export const chainDecoders: Record<string, (address: string) => string> = {
  [ERGO_CHAIN]: decodeErgoAddress,
  [CARDANO_CHAIN]: decodeCardanoAddress,
  [BITCOIN_CHAIN]: decodeBitcoinAddress,
  [ETHEREUM_CHAIN]: generateEvmAddressDecoder(ETHEREUM_CHAIN),
  [BINANCE_CHAIN]: generateEvmAddressDecoder(BINANCE_CHAIN),
  [DOGE_CHAIN]: decodeDogeAddress,
  [BITCOIN_RUNES_CHAIN]: decodeBitcoinRunesAddress,
  [FIRO_CHAIN]: decodeFiroAddress,
  [HANDSHAKE_CHAIN]: decodeHandshakeAddress,
};

/**
 * decodes address of a chain
 * @param chain
 * @param encodedAddress
 */
export const decodeAddress = (
  chain: string,
  encodedAddress: string,
): string => {
  const decoder = chainDecoders[chain];
  if (decoder) return decoder(encodedAddress);
  throw new UnsupportedChainError(chain);
};
