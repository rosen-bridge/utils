import { validateBitcoinAddress } from './chains/bitcoin';
import { validateBitcoinRunesAddress } from './chains/bitcoinRunes';
import { validateCardanoAddress } from './chains/cardano';
import { validateDogeAddress } from './chains/doge';
import { validateErgoAddress } from './chains/ergo';
import { generateEvmAddressValidator } from './chains/evm';
import { validateFiroAddress } from './chains/firo';
import { validateHandshakeAddress } from './chains/handshake';
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

export const chainValidators: Record<string, (address: string) => void> = {
  [ERGO_CHAIN]: validateErgoAddress,
  [CARDANO_CHAIN]: validateCardanoAddress,
  [BITCOIN_CHAIN]: validateBitcoinAddress,
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
