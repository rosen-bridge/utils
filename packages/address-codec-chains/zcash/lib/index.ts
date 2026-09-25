import { createZcashAddressCodec } from './zcash';

export * from './zcash';

export const ZCASH_CHAIN = 'zcash';

// The shared codec registry uses mainnet addresses. Regtest and testnet
// services must construct a codec for their selected network explicitly.
const mainnet = createZcashAddressCodec('mainnet');
export const encodeZcashAddress = mainnet.encodeAddress;
export const decodeZcashAddress = mainnet.decodeAddress;
export const validateZcashAddress = mainnet.validateAddress;
