import {
  BITCOIN_CHAIN,
  decodeBitcoinAddress,
} from '@rosen-bridge/address-codec-bitcoin';
import {
  BITCOIN_RUNES_CHAIN,
  decodeBitcoinRunesAddress,
} from '@rosen-bridge/address-codec-bitcoin-runes';
import {
  CARDANO_CHAIN,
  decodeCardanoAddress,
} from '@rosen-bridge/address-codec-cardano';
import {
  DOGE_CHAIN,
  decodeDogeAddress,
} from '@rosen-bridge/address-codec-doge';
import {
  ERGO_CHAIN,
  decodeErgoAddress,
} from '@rosen-bridge/address-codec-ergo';
import { generateEvmAddressDecoder } from '@rosen-bridge/address-codec-evm';
import {
  FIRO_CHAIN,
  decodeFiroAddress,
} from '@rosen-bridge/address-codec-firo';
import {
  HANDSHAKE_CHAIN,
  decodeHandshakeAddress,
} from '@rosen-bridge/address-codec-handshake';

import { BINANCE_CHAIN, ETHEREUM_CHAIN } from './const';
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
