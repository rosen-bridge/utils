import {
  BITCOIN_CHAIN,
  encodeBitcoinAddress,
} from '@rosen-bridge/address-codec-bitcoin';
import {
  BITCOIN_RUNES_CHAIN,
  encodeBitcoinRunesAddress,
} from '@rosen-bridge/address-codec-bitcoin-runes';
import {
  CARDANO_CHAIN,
  encodeCardanoAddress,
} from '@rosen-bridge/address-codec-cardano';
import {
  DOGE_CHAIN,
  encodeDogeAddress,
} from '@rosen-bridge/address-codec-doge';
import {
  ERGO_CHAIN,
  encodeErgoAddress,
} from '@rosen-bridge/address-codec-ergo';
import { generateEvmAddressEncoder } from '@rosen-bridge/address-codec-evm';
import {
  FIRO_CHAIN,
  encodeFiroAddress,
} from '@rosen-bridge/address-codec-firo';
import {
  HANDSHAKE_CHAIN,
  encodeHandshakeAddress,
} from '@rosen-bridge/address-codec-handshake';

import { BINANCE_CHAIN, ETHEREUM_CHAIN } from './const';
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
