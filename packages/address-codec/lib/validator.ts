import {
  BITCOIN_CHAIN,
  validateBitcoinAddress,
} from '@rosen-bridge/address-codec-bitcoin';
import {
  BITCOIN_RUNES_CHAIN,
  validateBitcoinRunesAddress,
} from '@rosen-bridge/address-codec-bitcoin-runes';
import {
  CARDANO_CHAIN,
  validateCardanoAddress,
} from '@rosen-bridge/address-codec-cardano';
import {
  DOGE_CHAIN,
  validateDogeAddress,
} from '@rosen-bridge/address-codec-doge';
import {
  ERGO_CHAIN,
  validateErgoAddress,
} from '@rosen-bridge/address-codec-ergo';
import { generateEvmAddressValidator } from '@rosen-bridge/address-codec-evm';
import {
  FIRO_CHAIN,
  validateFiroAddress,
} from '@rosen-bridge/address-codec-firo';
import {
  HANDSHAKE_CHAIN,
  validateHandshakeAddress,
} from '@rosen-bridge/address-codec-handshake';

import { BASE_CHAIN, BINANCE_CHAIN, ETHEREUM_CHAIN } from './const';
import { UnsupportedChainError } from './types';

export const chainValidators: Record<string, (address: string) => void> = {
  [ERGO_CHAIN]: validateErgoAddress,
  [CARDANO_CHAIN]: validateCardanoAddress,
  [BITCOIN_CHAIN]: validateBitcoinAddress,
  [BASE_CHAIN]: generateEvmAddressValidator(BASE_CHAIN),
  [ETHEREUM_CHAIN]: generateEvmAddressValidator(ETHEREUM_CHAIN),
  [BINANCE_CHAIN]: generateEvmAddressValidator(BINANCE_CHAIN),
  [DOGE_CHAIN]: validateDogeAddress,
  [BITCOIN_RUNES_CHAIN]: validateBitcoinRunesAddress,
  [FIRO_CHAIN]: validateFiroAddress,
  [HANDSHAKE_CHAIN]: validateHandshakeAddress,
};

/**
 * validates address of a chain
 * @param chain
 * @param address
 */
export const validateAddress = (chain: string, address: string): void => {
  const validator = chainValidators[chain];
  if (validator) validator(address);
  else throw new UnsupportedChainError(chain);
};
