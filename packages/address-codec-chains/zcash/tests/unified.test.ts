/* eslint vitest/expect-expect: off -- assertions use node:assert. */
import { bech32m } from 'bech32';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'vitest';

import { AddressManager } from '@rosen-bridge/address-manager';

import {
  createZcashAddressCodec,
  UnsupportedZcashAddressError,
  type ZcashNetwork,
} from '../lib/index.js';

type Vector = { network: ZcashNetwork; address: string; receiverHex: string };
const vectors = JSON.parse(
  readFileSync(
    new URL('./fixtures/unified-addresses.json', import.meta.url),
    'utf8',
  ),
) as {
  valid: Vector[];
  invalid: { name: string; address: string; reason: string }[];
};

function fails(action: () => unknown, reason?: string) {
  assert.throws(
    action,
    (error: unknown) =>
      error instanceof UnsupportedZcashAddressError &&
      (!reason || error.reason === reason),
  );
}

test('independent Rust vectors admit exact Orchard receivers on each network', () => {
  assert.ok(vectors.valid.length > 30);
  for (const vector of vectors.valid) {
    const codec = createZcashAddressCodec(vector.network);
    assert.deepEqual(codec.parseRecipient(vector.address), {
      kind: 'orchard',
      network: vector.network,
      address: vector.address,
      receiverHex: vector.receiverHex,
    });
    assert.doesNotThrow(() => codec.validateAddress(vector.address));
    assert.ok(Object.isFrozen(codec.parseRecipient(vector.address)));
    fails(() => codec.parseAddress(vector.address), 'unsupported-kind');
    fails(
      () => codec.validateTransparentAddress(vector.address),
      'unsupported-kind',
    );
    fails(() => codec.encodeAddress(vector.address), 'unsupported-kind');
    fails(() => codec.decodeAddress(vector.receiverHex), 'encoding');
  }
});

test('malformed native encodings and unsupported recipient profiles fail closed', () => {
  const codec = createZcashAddressCodec('mainnet');
  for (const vector of vectors.invalid) {
    fails(() => codec.parseRecipient(vector.address), vector.reason);
    fails(() => codec.validateAddress(vector.address), vector.reason);
  }
});

test('an invalid Sapling receiver beside valid Orchard fails independently', () => {
  const invalidSapling = vectors.invalid.find(
    (vector) => vector.name === 'invalid all-zero Sapling plus valid Orchard',
  );
  assert.ok(invalidSapling);
  fails(
    () =>
      createZcashAddressCodec('mainnet').parseRecipient(invalidSapling.address),
    'encoding',
  );
});

test('all three Unified Address networks are distinct and cannot be relabelled', () => {
  for (const vector of vectors.valid) {
    for (const network of ['mainnet', 'testnet', 'regtest'] as const) {
      if (network !== vector.network) {
        fails(
          () => createZcashAddressCodec(network).parseRecipient(vector.address),
          'network',
        );
      }
    }
  }
  const vector = vectors.valid.find((v) => v.network === 'mainnet')!;
  const decoded = bech32m.decode(vector.address, 256);
  // A recomputed outer checksum cannot rebind the inner HRP padding.
  const relabelled = bech32m.encode('utest', decoded.words, 256);
  fails(
    () => createZcashAddressCodec('testnet').parseRecipient(relabelled),
    'encoding',
  );
});

test('canonical lowercase address is preserved; no whitespace or aliases are accepted', () => {
  const codec = createZcashAddressCodec('mainnet');
  const address = vectors.valid[0].address;
  for (const bad of [
    address.toUpperCase(),
    ' ' + address,
    address + '\n',
    'zcash:' + address,
    address.slice(0, 7).toUpperCase() + address.slice(7),
    'u1' + 'q'.repeat(10000),
  ]) {
    fails(() => codec.parseRecipient(bad));
  }
  const wrongChecksum =
    address.slice(0, -1) + (address.endsWith('q') ? 'p' : 'q');
  fails(() => codec.parseRecipient(wrongChecksum), 'checksum');
  const oversized = bech32m.encode(
    'u',
    bech32m.toWords(Buffer.alloc(129)),
    256,
  );
  fails(() => codec.parseRecipient(oversized), 'encoding');
});

test('actual AddressManager admits UTF-8 Ergo destination but compact decoder stays transparent', () => {
  const codec = createZcashAddressCodec('regtest');
  const manager = AddressManager.init(
    { zcash: codec.validateAddress },
    { zcash: codec.decodeAddress },
  );
  const vector = vectors.valid.find((v) => v.network === 'regtest')!;
  const r4Address = Buffer.from(vector.address, 'utf8');
  const extracted = r4Address.toString('utf8');
  assert.equal(extracted, vector.address);
  assert.doesNotThrow(() => manager.validateAddress('zcash', extracted));
  assert.equal(codec.parseRecipient(extracted).kind, 'orchard');
  fails(
    () => manager.decodeAddress('zcash', r4Address.toString('hex')),
    'encoding',
  );
  const transparent = 'tm9iMLAuYMzJ6jtFLcA7rzUmfreGuKvr7Ma';
  assert.deepEqual(
    codec.parseRecipient(transparent),
    codec.parseAddress(transparent),
  );
  assert.doesNotThrow(() => codec.validateTransparentAddress(transparent));
  assert.equal(
    manager.decodeAddress('zcash', codec.encodeAddress(transparent)),
    transparent,
  );
});
