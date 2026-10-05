import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  UnsupportedAddressError,
  decodeBitcoinCashAddress,
  encodeBitcoinCashAddress,
  validateBitcoinCashAddress,
} from '../lib';
import { vectors } from './bitcoinCashTestData';
import { invalidAddresses, invalidScripts } from './bitcoinCashTestUtils';

describe('encodeBitcoinCashAddress', () => {
  /**
   * @target encodeBitcoinCashAddress loads and roundtrips without libauth crypto initialization
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
    expect(child.stderr).toEqual('');
    expect(child.status).toEqual(0);
  });

  /**
   * @target encodeBitcoinCashAddress round trips official vector %s
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass each official CashAddr vector.
   * @expected Return the exact canonical locking script.
   */
  it.each(vectors)('round trips official vector %s', (address, script) => {
    expect(encodeBitcoinCashAddress(address)).toEqual(script);
  });

  /**
   * @target encodeBitcoinCashAddress canonicalizes uppercase address %s
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass the uppercase CashAddr vector.
   * @expected Return the exact canonical locking script.
   */
  it.each(vectors)('canonicalizes uppercase address %s', (address, script) => {
    expect(encodeBitcoinCashAddress(address.toUpperCase())).toEqual(script);
  });

  /**
   * @target encodeBitcoinCashAddress rejects %s
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
   * @target decodeBitcoinCashAddress round trips official vector %s
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Decode each official locking script vector.
   * @expected Return the exact lowercase prefixed CashAddr.
   */
  it.each(vectors)('round trips official vector %s', (address, script) => {
    expect(decodeBitcoinCashAddress(script)).toEqual(address);
  });

  /**
   * @target decodeBitcoinCashAddress canonicalizes uppercase address %s
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Decode the uppercase hexadecimal script.
   * @expected Return the exact lowercase prefixed CashAddr.
   */
  it.each(vectors)('canonicalizes uppercase address %s', (address, script) => {
    expect(decodeBitcoinCashAddress(script.toUpperCase())).toEqual(address);
  });

  /**
   * @target decodeBitcoinCashAddress rejects script %s
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
   * @target decodeBitcoinCashAddress bounds diagnostics for oversized script input
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
   * @target validateBitcoinCashAddress round trips official vector %s
   * @dependencies Real native codec and unchanged CashAddr or locking-script vectors
   * @scenario Pass each official CashAddr vector.
   * @expected Accept the address without throwing.
   */
  it.each(vectors)('round trips official vector %s', (address) => {
    expect(() => validateBitcoinCashAddress(address)).not.toThrow();
  });

  /**
   * @target validateBitcoinCashAddress canonicalizes uppercase address %s
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
   * @target validateBitcoinCashAddress rejects %s
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
