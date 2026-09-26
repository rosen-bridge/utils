/* eslint vitest/expect-expect: off -- these tests assert through node:assert and fails(). */
import base58check from 'bs58check';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'vitest';

import { AddressManager } from '@rosen-bridge/address-manager';

import {
  createZcashAddressCodec,
  UnsupportedZcashAddressError,
  type ZcashNetwork,
} from '../lib/index.js';

// Independent vectors: librustzcash 6192772887e1bcfd3fc4b7af2d945f8b6b267e60,
// components/zcash_address/src/encoding.rs, transparent(): hash160 is all zero.
const mainAddress = 't1Hsc1LR8yKnbbe3twRp88p6vFfC5t7DLbs';
const testAddress = 'tm9iMLAuYMzJ6jtFLcA7rzUmfreGuKvr7Ma';
const zeroHash = '00'.repeat(20);
const main = createZcashAddressCodec('mainnet');
const local = createZcashAddressCodec('regtest');

for (const [network, address, prefix] of [
  ['mainnet', mainAddress, '1cb8'],
  ['testnet', testAddress, '1d25'],
  ['regtest', testAddress, '1d25'],
] as const) {
  test(
    network + ' matches independent native address vector and explicit type',
    () => {
      const codec = createZcashAddressCodec(network);
      assert.equal(codec.encodeAddress(address), prefix + zeroHash);
      assert.equal(codec.decodeAddress(prefix + zeroHash), address);
      assert.deepEqual(codec.parseAddress(address), {
        kind: 'transparent-p2pkh',
        network,
        address,
        payloadHex: prefix + zeroHash,
        scriptPubKeyHex: '76a914' + zeroHash + '88ac',
      });
      assert.doesNotThrow(() => codec.validateAddress(address));
    },
  );
}

function fails(action: () => unknown, reason: string) {
  assert.throws(
    action,
    (error: unknown) =>
      error instanceof UnsupportedZcashAddressError && error.reason === reason,
  );
}

test('network is mandatory and validated at runtime', () => {
  for (const bad of [undefined, '', 'bitcoin', 'MAINNET', '__proto__']) {
    fails(() => createZcashAddressCodec(bad as ZcashNetwork), 'network');
  }
});

test('a valid address on the other network family is rejected in all routes', () => {
  fails(() => main.encodeAddress(testAddress), 'network');
  fails(() => local.validateAddress(mainAddress), 'network');
  fails(() => main.decodeAddress('1d25' + zeroHash), 'network');
  fails(() => local.decodeAddress('1cb8' + zeroHash), 'network');
});

test('valid P2SH vectors remain unsupported for both network families', () => {
  for (const [network, address, prefix] of [
    ['mainnet', 't3JZcvsuaXE6ygokL4XUiZSTrQBUoPYFnXJ', '1cbd'],
    ['testnet', 't26YoyZ1iPgiMEWL4zGUm74eVWfhyDMXzY2', '1cba'],
  ] as const) {
    const codec = createZcashAddressCodec(network);
    fails(() => codec.validateAddress(address), 'unsupported-kind');
    fails(() => codec.decodeAddress(prefix + zeroHash), 'unsupported-kind');
  }
});

test('valid Sprout, Sapling, Unified and TEX encodings never fall back to P2PKH', () => {
  const unsupported = [
    'zc8E5gYid86n4bo2Usdq1cpr7PpfoJGzttwBHEEgGhGkLUg7SPPVFNB2AkRFXZ7usfphup5426dt1buMmY3fkYeRrQGLa8y',
    'zs1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpq6d8g',
    // Native unified vector containing both P2PKH and Sapling receivers.
    'u1l8xunezsvhq8fgzfl7404m450nwnd76zshscn6nfys7vyz2ywyh4cc5daaq0c7q2su5lqfh23sp7fkf3kt27ve5948mzpfdvckzaect2jtte308mkwlycj2u0eac077wu70vqcetkxf',
    'textest1qyqszqgpqyqszqgpqyqszqgpqyqszqgpfcjgfy',
  ];
  for (const address of unsupported) {
    fails(() => main.encodeAddress(address), 'unsupported-kind');
    fails(() => main.parseAddress(address), 'unsupported-kind');
  }
});

test('checksum fault is distinct from a valid but unsupported address', () => {
  fails(() => main.validateAddress(mainAddress.slice(0, -1) + 't'), 'checksum');
});

test('rejects whitespace, invalid alphabet, aliases and unbounded input', () => {
  for (const bad of [
    '',
    ' ' + mainAddress,
    mainAddress + '\n',
    '1' + mainAddress,
    mainAddress.slice(0, -1) + '0',
    'a'.repeat(100000),
  ]) {
    fails(() => main.encodeAddress(bad), 'encoding');
  }
});

test('encoded address must be exactly 22 canonical lowercase bytes', () => {
  for (const encoded of [
    '',
    '1cb8' + zeroHash + '00',
    '1cb8' + zeroHash.slice(2),
    '1CB8' + zeroHash,
    '0x1cb8' + zeroHash,
    '1cb8' + zeroHash.slice(1),
    '1cb8' + zeroHash.slice(2) + 'gg',
    '76a914' + zeroHash + '88ac',
  ]) {
    fails(() => main.decodeAddress(encoded), 'encoding');
  }
});

test('payload decoder never emits an address for extra bytes', () => {
  assert.equal(main.decodeAddress('1cb8' + zeroHash), mainAddress);
  fails(() => main.decodeAddress('1cb8' + zeroHash + '00'), 'encoding');
});

test('self-consistent unknown prefix and wrong-length Base58Check payloads fail', () => {
  fails(() => main.decodeAddress('0000' + zeroHash), 'unsupported-kind');
  // The encoding contract admits exactly the 35-character P2PKH/P2SH format.
  const unknown = base58check.encode(Buffer.from('1cb9' + zeroHash, 'hex'));
  fails(() => main.encodeAddress(unknown), 'unsupported-kind');
  for (const count of [19, 21]) {
    const address = base58check.encode(
      Buffer.from('1cb8' + '00'.repeat(count), 'hex'),
    );
    fails(() => main.encodeAddress(address), 'encoding');
  }
});

test('real AddressManager decodes and validates the codec without replacement methods', () => {
  const manager = AddressManager.init(
    { zcash: local.validateAddress },
    { zcash: local.decodeAddress },
  );
  assert.equal(manager.decodeAddress('zcash', '1d25' + zeroHash), testAddress);
  assert.doesNotThrow(() => manager.validateAddress('zcash', testAddress));
  fails(() => manager.validateAddress('zcash', mainAddress), 'network');
  fails(
    () => manager.decodeAddress('zcash', '1cba' + zeroHash),
    'unsupported-kind',
  );
});

test('confirmed Zebra deposit output address matches its exact script and amount', () => {
  const block = JSON.parse(
    readFileSync(
      new URL('./fixtures/deposit-block.json', import.meta.url),
      'utf8',
    ),
  );
  const tx = block.tx.find(
    (tx: { txid: string }) =>
      tx.txid ===
      'aaf9bf3fc7be562ff268327ee983510480d212df65e2f91883f82aea60f7727b',
  );
  const output = tx.vout[0];
  assert.equal(output.valueZat, 100000000);
  const recipient = local.parseAddress(output.scriptPubKey.addresses[0]);
  assert.equal(recipient.scriptPubKeyHex, output.scriptPubKey.hex);
  assert.equal(local.decodeAddress(recipient.payloadHex), recipient.address);
});
