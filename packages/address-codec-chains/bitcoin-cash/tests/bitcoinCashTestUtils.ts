import {
  CashAddressType,
  encodeCashAddress,
  encodeCashAddressNonStandard,
  encodeCashAddressFormat,
} from '@bitauth/libauth';

import { hash, vectors } from './bitcoinCashTestData';

/** Build a CashAddr fixture with an isolated network, type or payload-size choice. */
const makeAddress = (
  type: CashAddressType,
  prefix: 'bitcoincash' | 'bchtest' | 'bchreg' = 'bitcoincash',
  size = 20,
) => encodeCashAddress({ type, prefix, payload: new Uint8Array(size) }).address;

/** Isolated malformed and unsupported CashAddr cases, including generated type and network variants. */
export const invalidAddresses = [
  ['short input', vectors[0][0].slice(0, -1)],
  ['long input', vectors[0][0] + 'q'],
  ['huge input', 'bitcoincash:' + 'q'.repeat(1_000_000)],
  ['mixed case', vectors[0][0].replace('qpm', 'Qpm')],
  ['prefixless', vectors[0][0].split(':')[1]],
  ['legacy Base58', '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu'],
  ['testnet', makeAddress(CashAddressType.p2pkh, 'bchtest')],
  ['regtest', makeAddress(CashAddressType.p2pkh, 'bchreg')],
  ['token P2PKH intent', makeAddress(CashAddressType.p2pkhWithTokens)],
  ['token P2SH intent', makeAddress(CashAddressType.p2shWithTokens)],
  ['P2SH32', makeAddress(CashAddressType.p2sh, 'bitcoincash', 32)],
  [
    '24-byte hash',
    'bitcoincash:q9adhakpwzztepkpwp5z0dq62m6u5v5xtyj7j3h2ws4mr9g0',
  ],
  ['checksum', vectors[0][0].slice(0, -1) + 'q'],
  ['double prefix', 'bitcoincash:' + vectors[0][0]],
  ['whitespace', vectors[0][0] + ' '],
  ['SegWit', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080'],
  [
    'unknown type',
    encodeCashAddressNonStandard({
      prefix: 'bitcoincash',
      typeBits: 4,
      payload: new Uint8Array(20),
    }).address,
  ],
  [
    'reserved version bit',
    encodeCashAddressFormat({
      prefix: 'bitcoincash',
      version: 128,
      payload: new Uint8Array(20),
    }).address,
  ],
];

/** Isolated malformed and unsupported locking-script cases derived from the official hash. */
export const invalidScripts = [
  ['empty', ''],
  ['odd hex', vectors[0][1].slice(1)],
  ['nonhex', vectors[0][1].replace('76', 'zz')],
  ['space', vectors[0][1] + ' '],
  ['0x prefix', '0x' + vectors[0][1]],
  ['over 60 bytes', '00'.repeat(61)],
  ['60-byte unsupported script', '00'.repeat(60)],
  ['truncated hash', `76a914${hash.slice(2)}88ac`],
  ['trailing opcode', vectors[0][1] + '00'],
  ['nonminimal PUSHDATA1', `76a94c14${hash}88ac`],
  ['wrong terminal opcode', `76a914${hash}88ad`],
  ['SegWit script', `0014${hash}`],
  ['P2SH32 script', `aa20${'00'.repeat(32)}87`],
  ['token prefix', `ef${vectors[0][1]}`],
];
