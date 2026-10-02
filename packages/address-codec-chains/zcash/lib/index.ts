import { createZcashAddressCodec } from './zcash.js';

export * from './zcash.js';
export { MAX_UNIFIED_ADDRESS_LENGTH } from './unified.js';

export const ZCASH_CHAIN = 'zcash';

// The shared codec registry uses mainnet addresses. Regtest and testnet
// services must construct a codec for their selected network explicitly.
const mainnet = createZcashAddressCodec('mainnet');
export const encodeZcashAddress = mainnet.encodeAddress;
export const decodeZcashAddress = mainnet.decodeAddress;
export const validateZcashAddress = mainnet.validateAddress;
export const parseZcashRecipient = mainnet.parseRecipient;
export const validateZcashTransparentAddress =
  mainnet.validateTransparentAddress;
