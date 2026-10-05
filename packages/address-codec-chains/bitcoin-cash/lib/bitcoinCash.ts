import {
  CashAddressType,
  decodeCashAddress,
  encodeCashAddress,
} from '@bitauth/libauth/build/lib/address/cash-address.js';

import { BITCOIN_CASH_CHAIN } from './const';
import { UnsupportedAddressError } from './types';

/** Reject an unsupported CashAddr or locking script with its validation reason. */
const unsupported = (value: string, reason: string): never => {
  throw new UnsupportedAddressError(BITCOIN_CASH_CHAIN, value, reason);
};

/** Encodes native mainnet P2PKH20/P2SH20 CashAddr as exact locking script hex. */
export const encodeBitcoinCashAddress = (address: string): string => {
  // A mainnet prefix plus a 20-byte CashAddr payload and checksum is 54 characters.
  if (address.length !== 54)
    return unsupported(
      `${address.length} characters`,
      'native CashAddr must be exactly 54 characters',
    );
  if (address !== address.toLowerCase() && address !== address.toUpperCase())
    return unsupported(address, 'mixed case');
  const normalized = address.toLowerCase();
  if (!normalized.startsWith('bitcoincash:'))
    return unsupported(address, 'explicit mainnet CashAddr prefix required');
  const decoded = decodeCashAddress(normalized);
  if (typeof decoded === 'string') return unsupported(address, decoded);
  if (
    decoded.prefix !== 'bitcoincash' ||
    decoded.payload.length !== 20 ||
    (decoded.type !== CashAddressType.p2pkh &&
      decoded.type !== CashAddressType.p2sh)
  )
    return unsupported(
      address,
      'only native mainnet P2PKH20 and P2SH20 are supported',
    );
  const hash = Buffer.from(decoded.payload).toString('hex');
  return decoded.type === CashAddressType.p2pkh
    ? `76a914${hash}88ac`
    : `a914${hash}87`;
};

/** Decodes only canonical P2PKH20/P2SH20 scripts to lowercase prefixed CashAddr. */
export const decodeBitcoinCashAddress = (encodedAddress: string): string => {
  if (encodedAddress.length > 60 * 2)
    return unsupported(
      `${encodedAddress.length} characters`,
      'locking script must not exceed 60 bytes',
    );
  if (!/^(?:[0-9a-fA-F]{2})+$/.test(encodedAddress))
    return unsupported(encodedAddress, 'invalid script hex or length');
  const script = encodedAddress.toLowerCase();
  const p2pkh = /^76a914([0-9a-f]{40})88ac$/.exec(script);
  const p2sh = /^a914([0-9a-f]{40})87$/.exec(script);
  const match = p2pkh ?? p2sh;
  if (!match)
    return unsupported(
      encodedAddress,
      'noncanonical or unsupported locking script',
    );
  return encodeCashAddress({
    prefix: 'bitcoincash',
    type: p2pkh ? CashAddressType.p2pkh : CashAddressType.p2sh,
    payload: Buffer.from(match[1], 'hex'),
  }).address;
};

/** Validate an ordinary mainnet CashAddr through the canonical native encoder. */
export const validateBitcoinCashAddress = (address: string): void => {
  encodeBitcoinCashAddress(address);
};
