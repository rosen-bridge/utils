import {
  CashAddressType,
  encodeCashAddress,
  encodeCashAddressNonStandard,
  encodeCashAddressFormat,
} from '@bitauth/libauth';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  UnsupportedAddressError,
  decodeBitcoinCashAddress,
  encodeBitcoinCashAddress,
  validateBitcoinCashAddress,
} from '../lib';

const hash = '76a04053bda0a88bda5177b86a15c3b29f559873';

describe('Bitcoin Cash codec module', () => {
  /**
   * @target Bitcoin Cash codec - preserves synchronous loading without crypto startup
   * @dependencies Fresh Node process, the actual source package and exact libauth pin
   * @scenario Require the codec with libauth crypto imports forbidden and roundtrip a public CashAddr vector
   * @expected Load synchronously, retain the native script and address, and validate successfully
   */
  it('loads and roundtrips without libauth crypto initialization', () => {
    const child = spawnSync(
      process.execPath,
      [
        '--import',
        'tsx',
        '--eval',
        `
      const assert = require('node:assert/strict');
      const { registerHooks } = require('node:module');
      registerHooks({
        load(url, context, nextLoad) {
          if (url.includes('/@bitauth/libauth/build/lib/crypto/'))
            throw Error('Unexpected libauth crypto import');
          return nextLoad(url, context);
        }
      });
      const codec = require('./lib/bitcoinCash.ts');
      const address = 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a';
      const script = '76a91476a04053bda0a88bda5177b86a15c3b29f55987388ac';
      assert.equal(codec.encodeBitcoinCashAddress(address), script);
      assert.equal(codec.decodeBitcoinCashAddress(script), address);
      assert.equal(codec.validateBitcoinCashAddress(address), undefined);
    `,
      ],
      {
        cwd: fileURLToPath(new URL('..', import.meta.url)),
        encoding: 'utf8',
        timeout: 10_000,
        env: { ...process.env, NODE_OPTIONS: '' },
      },
    );
    expect(child.error).toBeUndefined();
    expect(child.stderr).toBe('');
    expect(child.status).toBe(0);
  });
});
// Official CashAddr translation and larger-payload vectors:
// https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/cashaddr.md
const vectors = [
  [
    'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
    `76a914${hash}88ac`,
  ],
  ['bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq', `a914${hash}87`],
  [
    'bitcoincash:qr6m7j9njldwwzlg9v7v53unlr4jkmx6eylep8ekg2',
    '76a914f5bf48b397dae70be82b3cca4793f8eb2b6cdac988ac',
  ],
];
/** Build a CashAddr fixture with an isolated network, type or payload-size choice. */
const makeAddress = (
  type: CashAddressType,
  prefix: 'bitcoincash' | 'bchtest' | 'bchreg' = 'bitcoincash',
  size = 20,
) => encodeCashAddress({ type, prefix, payload: new Uint8Array(size) }).address;

const invalidAddresses = [
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

const invalidScripts = [
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
describe('encodeBitcoinCashAddress', () => {
  /**
   * @target encodeBitcoinCashAddress preserves the canonical address boundary
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass each official CashAddr vector.
   * @expected Return the exact canonical locking script.
   */
  it.each(vectors)('round trips official vector %s', (address, script) => {
    expect(encodeBitcoinCashAddress(address)).toEqual(script);
  });

  /**
   * @target encodeBitcoinCashAddress preserves the canonical address boundary
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass the uppercase CashAddr vector.
   * @expected Return the exact canonical locking script.
   */
  it.each(vectors)('canonicalizes uppercase address %s', (address, script) => {
    expect(encodeBitcoinCashAddress(address.toUpperCase())).toEqual(script);
  });

  /**
   * @target encodeBitcoinCashAddress rejects unsupported input
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass each isolated malformed or unsupported CashAddr vector.
   * @expected Throw UnsupportedAddressError for every vector.
   */
  it.each(invalidAddresses)('rejects %s', (_, address) => {
    expect(() => encodeBitcoinCashAddress(address)).toThrow(
      UnsupportedAddressError,
    );
  });
});

describe('decodeBitcoinCashAddress', () => {
  /**
   * @target decodeBitcoinCashAddress preserves the canonical address boundary
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Decode each official locking script vector.
   * @expected Return the exact lowercase prefixed CashAddr.
   */
  it.each(vectors)('round trips official vector %s', (address, script) => {
    expect(decodeBitcoinCashAddress(script)).toEqual(address);
  });

  /**
   * @target decodeBitcoinCashAddress preserves the canonical address boundary
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Decode the uppercase hexadecimal script.
   * @expected Return the exact lowercase prefixed CashAddr.
   */
  it.each(vectors)('canonicalizes uppercase address %s', (address, script) => {
    expect(decodeBitcoinCashAddress(script.toUpperCase())).toEqual(address);
  });

  /**
   * @target decodeBitcoinCashAddress rejects unsupported input
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass each isolated malformed or unsupported locking script vector.
   * @expected Throw UnsupportedAddressError for every vector.
   */
  it.each(invalidScripts)('rejects script %s', (_, script) => {
    expect(() => decodeBitcoinCashAddress(script)).toThrow(
      UnsupportedAddressError,
    );
  });

  /**
   * @target decodeBitcoinCashAddress should bound oversized-input diagnostics
   * @dependencies
   * - The real decoder and UnsupportedAddressError; no mocks
   * @scenario
   * - Decode a million-character script and inspect its failure message
   * @expected
   * - The error records the input size with a message below 256 characters
   */
  it('bounds diagnostics for oversized script input', () => {
    const script = '00'.repeat(500_000);
    try {
      decodeBitcoinCashAddress(script);
      expect.fail('oversized script was accepted');
    } catch (error) {
      expect(error).toBeInstanceOf(UnsupportedAddressError);
      const message = (error as Error).message;
      expect(message).toContain('1000000 characters');
      expect(message.length).toBeLessThan(256);
    }
  });
});

describe('validateBitcoinCashAddress', () => {
  /**
   * @target validateBitcoinCashAddress preserves the canonical address boundary
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass each official CashAddr vector.
   * @expected Accept the address without throwing.
   */
  it.each(vectors)('round trips official vector %s', (address) => {
    expect(() => validateBitcoinCashAddress(address)).not.toThrow();
  });

  /**
   * @target validateBitcoinCashAddress preserves the canonical address boundary
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass the uppercase CashAddr vector.
   * @expected Accept the address without throwing.
   */
  it.each(vectors)('canonicalizes uppercase address %s', (address) => {
    expect(() =>
      validateBitcoinCashAddress(address.toUpperCase()),
    ).not.toThrow();
  });

  /**
   * @target validateBitcoinCashAddress rejects unsupported input
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass each isolated malformed or unsupported CashAddr vector.
   * @expected Throw UnsupportedAddressError for every vector.
   */
  it.each(invalidAddresses)('rejects %s', (_, address) => {
    expect(() => validateBitcoinCashAddress(address)).toThrow(
      UnsupportedAddressError,
    );
  });
});
