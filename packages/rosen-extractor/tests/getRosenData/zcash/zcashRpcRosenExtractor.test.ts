/* eslint vitest/expect-expect: off -- these tests assert through node:assert. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'vitest';

import {
  decodeErgoAddress,
  validateErgoAddress,
} from '@rosen-bridge/address-codec-ergo';
import { AddressManager } from '@rosen-bridge/address-manager';
import { TokenMap } from '@rosen-bridge/tokens';

import type { NativeInspection } from '../../../lib/getRosenData/zcash/nativeInspection.js';
import { NativeZcashInspector } from '../../../lib/getRosenData/zcash/nativeInspection.js';
import {
  ZcashRpcRosenExtractor,
  type ZcashRpcTransaction,
} from '../../../lib/getRosenData/zcash/zcashRpcRosenExtractor.js';

const fixture = JSON.parse(
  readFileSync(
    new URL('./fixtures/zcash-block-106.json', import.meta.url),
    'utf8',
  ),
);
const deposit = fixture.transactions[1] as ZcashRpcTransaction;
const decoded = JSON.parse(
  readFileSync(
    new URL('./fixtures/deposit-inspection.json', import.meta.url),
    'utf8',
  ),
) as NativeInspection;
const reserve = 'tmXebSxnVN4HGSTK4icB4i3FitWjNv5u6pt';
const target = '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd';
const targetToken = 'ab'.repeat(32);

async function setup(
  inspection: NativeInspection = structuredClone(decoded),
  storeRawData = true,
) {
  AddressManager.init(
    { ergo: validateErgoAddress },
    { ergo: decodeErgoAddress },
  );
  const tokens = new TokenMap();
  await tokens.updateConfigByJson([
    {
      zcash: {
        tokenId: 'zec',
        name: 'Zcash',
        decimals: 8,
        type: 'native',
        residency: 'native',
        extra: {},
      },
      ergo: {
        tokenId: targetToken,
        name: 'Test wrapped ZEC',
        decimals: 8,
        type: 'wrapped',
        residency: 'wrapped',
        extra: {},
      },
    },
  ]);
  const options = {
    network: 'regtest' as const,
    lockAddress: reserve,
    tokens,
    branchIdAtHeight: (height: number) => {
      assert.equal(height, 106);
      return 'c2d6d0b4';
    },
    inspector: { inspect: () => structuredClone(inspection) },
    storeRawData,
  };
  return { tokens, options, extractor: new ZcashRpcRosenExtractor(options) };
}

test('real Rosen get extracts the exact deposit fields and keeps integer zatoshis', async () => {
  const { extractor } = await setup();
  assert.deepEqual(extractor.get(deposit), {
    toChain: 'ergo',
    toAddress: target,
    bridgeFee: '5000',
    networkFee: '2200',
    fromAddress:
      'box:f5ffc9c9d6fa6f4035a83debd4ed68421392dede37879d23f30ab00da7cda1e2.1',
    sourceChainTokenId: 'zec',
    amount: '100000000',
    targetChainTokenId: targetToken,
    sourceTxId: deposit.txid,
    rawData: decoded.transparent.outputs[2].script_pubkey_hex,
  });
});

test.skipIf(
  !process.env.ZCASH_INSPECTOR_BIN || !process.env.ZCASH_INSPECTOR_SHA256,
)(
  'real native executable and real Rosen get join on the same raw transaction',
  async () => {
    assert.ok(
      process.env.ZCASH_INSPECTOR_BIN && process.env.ZCASH_INSPECTOR_SHA256,
      'native build environment required',
    );
    const { options } = await setup();
    const extractor = new ZcashRpcRosenExtractor({
      ...options,
      inspector: new NativeZcashInspector({
        executablePath: process.env.ZCASH_INSPECTOR_BIN,
        expectedSha256: process.env.ZCASH_INSPECTOR_SHA256,
      }),
    });
    assert.equal(extractor.get(deposit)?.amount, '100000000');
    assert.equal(extractor.get(deposit)?.toAddress, target);
  },
);

test('base get rawData option remains effective', async () => {
  const { extractor } = await setup(structuredClone(decoded), false);
  assert.equal(extractor.get(deposit)?.rawData, 'raw-data extraction is off');
});

test('missing operational evidence propagates instead of becoming an ordinary nondeposit', async () => {
  const { options } = await setup();
  const unavailable = new Error('inspection unavailable');
  const extractor = new ZcashRpcRosenExtractor({
    ...options,
    inspector: {
      inspect: () => {
        throw unavailable;
      },
    },
  });
  assert.throws(
    () => extractor.get(deposit),
    (error) => error === unavailable,
  );
  const healthy = new ZcashRpcRosenExtractor(options);
  assert.throws(
    () =>
      healthy.get({
        ...deposit,
        hex: undefined,
      } as unknown as ZcashRpcTransaction),
    /evidence/,
  );
  assert.throws(
    () => healthy.get({ ...deposit, size: deposit.size + 1 }),
    /evidence/,
  );
  assert.throws(
    () => healthy.get({ ...deposit, txid: 'cd'.repeat(32) }),
    /identity/,
  );
});

test('missing AddressManager handlers defer extraction before base get can swallow the failure', async () => {
  const { extractor } = await setup();
  AddressManager.init({}, {});
  assert.throws(() => extractor.get(deposit), /configuration/);
});

test('missing or ambiguous TokenMap configuration cannot silently skip a deposit', async () => {
  const { extractor, tokens } = await setup();
  const config = tokens.getConfig();
  await tokens.updateConfigByJson([]);
  assert.throws(() => extractor.get(deposit), /configuration/);
  await tokens.updateConfigByJson([...config, ...config]);
  assert.throws(() => extractor.get(deposit), /configuration/);
});

test('unqualified decimal conversion is an explicit configuration error', async () => {
  const { extractor, tokens } = await setup();
  const config = tokens.getConfig();
  config[0].ergo.decimals = 6;
  await tokens.updateConfigByJson(config);
  assert.throws(() => extractor.get(deposit), /configuration/);
});

test('third-chain decimals cannot change Zcash amounts through TokenMap', async () => {
  const { extractor, tokens } = await setup();
  const config = tokens.getConfig();
  config[0].ethereum = { ...config[0].zcash, tokenId: 'eth-zec', decimals: 6 };
  await tokens.updateConfigByJson(config);
  assert.equal(tokens.wrapAmount('zec', 100000001n, 'zcash').amount, 1000001n);
  assert.throws(() => extractor.get(deposit), /configuration/);
  config[0].ethereum.decimals = 18;
  await tokens.updateConfigByJson(config);
  assert.equal(extractor.get(deposit)?.amount, '100000000');
});

test('cross-set aliases, including unbridgeable sets, are explicit configuration failures', async () => {
  const { extractor, tokens } = await setup();
  const config = tokens.getConfig();
  await tokens.updateConfigByJson([
    {
      bitcoin: { ...config[0].zcash },
      ergo: { ...config[0].ergo, tokenId: 'cd'.repeat(32) },
    },
    ...config,
  ]);
  assert.throws(() => extractor.get(deposit), /configuration/);
  await tokens.updateConfigByJson([
    ...config,
    { bitcoin: { ...config[0].zcash } },
  ]);
  assert.equal(tokens.getConfig().length, 1);
  assert.equal(tokens.getRawConfig().length, 2);
  assert.throws(() => extractor.get(deposit), /configuration/);
});

test('registered decoder failures or substitutions do not look like invalid user data', async () => {
  const { extractor } = await setup();
  for (const decoder of [
    () => {
      throw new Error('decoder unavailable');
    },
    () => 'different address',
  ]) {
    AddressManager.init({ ergo: validateErgoAddress }, { ergo: decoder });
    assert.throws(() => extractor.get(deposit), /configuration/);
  }
});

test('base getter validator failure defers a valid candidate and permits a healthy retry', async () => {
  const { extractor } = await setup();
  AddressManager.init(
    {
      ergo: () => {
        throw new Error('validator unavailable');
      },
    },
    { ergo: decodeErgoAddress },
  );
  assert.throws(() => extractor.get(deposit), /configuration/);
  AddressManager.init(
    { ergo: validateErgoAddress },
    { ergo: decodeErgoAddress },
  );
  assert.equal(extractor.get(deposit)?.toAddress, target);
});

test('a reentrant registry callback cannot corrupt the base getter admission marker', async () => {
  const { extractor } = await setup();
  AddressManager.init(
    {
      ergo: () => {
        extractor.get(deposit);
      },
    },
    { ergo: decodeErgoAddress },
  );
  assert.throws(() => extractor.get(deposit), /configuration/);
});

test('native branch disagreement and invalid branch configuration propagate', async () => {
  const otherBranch = structuredClone(decoded);
  otherBranch.consensus_branch_id = 'deadbeef';
  const { extractor, options } = await setup(otherBranch);
  assert.throws(() => extractor.get(deposit), /identity/);
  assert.throws(
    () =>
      new ZcashRpcRosenExtractor({
        ...options,
        branchIdAtHeight: () => '',
      }).get(deposit),
    /configuration/,
  );
});

test('invalid P2PK key and unsupported destination index are complete nondeposits', async () => {
  for (const payload of [
    '00' +
      decoded.transparent.outputs[2].script_pubkey_hex.slice(6, 40) +
      '00'.repeat(33),
    '01' + decoded.transparent.outputs[2].script_pubkey_hex.slice(6),
  ]) {
    const value = structuredClone(decoded);
    value.transparent.outputs[2].script_pubkey_hex = '6a33' + payload;
    const { extractor } = await setup(value);
    assert.equal(extractor.get(deposit), undefined);
  }
});

test('complete coinbase, shielded, and ordinary transactions do not become deposits', async () => {
  for (const mutate of [
    (value: NativeInspection) => {
      value.coinbase = true;
    },
    (value: NativeInspection) => {
      value.fully_transparent = false;
      value.shielded.present = true;
      value.shielded.sapling_outputs = 1;
    },
    (value: NativeInspection) => {
      value.transparent.outputs = value.transparent.outputs.slice(1);
    },
    (value: NativeInspection) => {
      value.transparent.outputs = value.transparent.outputs.slice(0, 2);
    },
  ]) {
    const value = structuredClone(decoded);
    mutate(value);
    const { extractor } = await setup(value);
    assert.equal(extractor.get(deposit), undefined);
  }
});

test('two reserve outputs or two metadata outputs are ambiguous', async () => {
  for (const selected of [0, 2]) {
    const value = structuredClone(decoded);
    value.transparent.outputs.push({
      ...value.transparent.outputs[selected],
      index: 3,
    });
    const { extractor } = await setup(value);
    assert.equal(extractor.get(deposit), undefined);
  }
});

test('malformed or extended Rosen metadata is rejected without permissive trailing-byte parsing', async () => {
  for (const script of [
    '6a00',
    decoded.transparent.outputs[2].script_pubkey_hex + '00',
    '6a34' + decoded.transparent.outputs[2].script_pubkey_hex.slice(4) + '00',
    '6a4c33' + decoded.transparent.outputs[2].script_pubkey_hex.slice(4),
  ]) {
    const value = structuredClone(decoded);
    value.transparent.outputs[2].script_pubkey_hex = script;
    const { extractor } = await setup(value);
    assert.equal(extractor.get(deposit), undefined);
  }
});

test('a metadata output with nonzero value or zero reserve value is not admitted', async () => {
  for (const [index, amount] of [
    [2, 1],
    [0, 0],
  ]) {
    const value = structuredClone(decoded);
    value.transparent.outputs[index].value_zat = amount;
    const { extractor } = await setup(value);
    assert.equal(extractor.get(deposit), undefined);
  }
});

test.skipIf(
  !process.env.ZCASH_INSPECTOR_BIN || !process.env.ZCASH_INSPECTOR_SHA256,
)(
  'real serialized metadata mutants recompute txid before extraction',
  async () => {
    assert.ok(
      process.env.ZCASH_INSPECTOR_BIN && process.env.ZCASH_INSPECTOR_SHA256,
      'native build environment required',
    );
    const inspector = new NativeZcashInspector({
      executablePath: process.env.ZCASH_INSPECTOR_BIN,
      expectedSha256: process.env.ZCASH_INSPECTOR_SHA256,
    });
    const { options } = await setup();
    const extractor = new ZcashRpcRosenExtractor({ ...options, inspector });
    const original = decoded.transparent.outputs[2].script_pubkey_hex;
    const serializedScript = '35' + original;
    assert.equal(
      deposit.hex.split(serializedScript).length,
      2,
      'unique output script and CompactSize',
    );
    for (const script of [
      original + '00',
      '6a34' + original.slice(4) + '00',
      '6a4c33' + original.slice(4),
      '6a3301' + original.slice(6),
      original.slice(0, 40) + '00'.repeat(33),
      original.slice(0, 40) + '02' + 'ff'.repeat(32),
    ]) {
      const encodedScript =
        (script.length / 2).toString(16).padStart(2, '0') + script;
      const hex = deposit.hex.replace(serializedScript, encodedScript);
      const native = inspector.inspect(hex, 'c2d6d0b4');
      assert.equal(native.transparent.outputs[2].script_pubkey_hex, script);
      assert.notEqual(native.txid, deposit.txid);
      const transaction = {
        ...deposit,
        hex,
        size: hex.length / 2,
        txid: native.txid,
      };
      assert.equal(extractor.get(transaction), undefined);
    }
    // Syntactically valid metadata retains the full uint64 fee without a JS-number conversion.
    const script =
      original.slice(0, 6) + 'ffffffffffffffff' + original.slice(22);
    const hex = deposit.hex.replace(serializedScript, '35' + script);
    const native = inspector.inspect(hex, 'c2d6d0b4');
    assert.equal(
      extractor.get({
        ...deposit,
        hex,
        size: hex.length / 2,
        txid: native.txid,
      })?.bridgeFee,
      '18446744073709551615',
    );
  },
);

test('raw native values remain authoritative over redundant RPC display fields', async () => {
  const { extractor } = await setup();
  assert.equal(
    extractor.get({ ...deposit, vout: [{ value: 0.00000001 }], vin: [] })
      ?.amount,
    '100000000',
  );
});

test('independent malformed RPC envelope fields fail before native parsing', async () => {
  const { options } = await setup();
  let calls = 0;
  const extractor = new ZcashRpcRosenExtractor({
    ...options,
    inspector: {
      inspect: () => {
        calls += 1;
        throw new Error('unexpected native call');
      },
    },
  });
  for (const fields of [
    { hex: deposit.hex.toUpperCase() },
    { hex: '0' },
    { hex: 'gg' },
    { size: undefined },
    { size: '1' },
    { size: Number.MAX_SAFE_INTEGER + 1 },
    { txid: undefined },
    { txid: 'ab'.repeat(31) },
    { txid: deposit.txid.toUpperCase() },
    { blockhash: undefined },
    { blockhash: 'gg'.repeat(32) },
    { blockhash: 'ab'.repeat(31) },
    { height: -1 },
    { height: 1.5 },
    { height: '106' },
    { height: Number.MAX_SAFE_INTEGER + 1 },
  ]) {
    assert.throws(
      () =>
        extractor.get({
          ...deposit,
          ...fields,
        } as unknown as ZcashRpcTransaction),
      /evidence/,
    );
  }
  assert.equal(calls, 0);
});

test('the full raw envelope size limit reaches the native parser and one byte more does not', async () => {
  const { options } = await setup();
  let calls = 0;
  const reachedParser = new Error('structural fixture reached parser');
  const extractor = new ZcashRpcRosenExtractor({
    ...options,
    inspector: {
      inspect: () => {
        calls += 1;
        throw reachedParser;
      },
    },
  });
  const atLimit = { ...deposit, hex: '00'.repeat(2_000_000), size: 2_000_000 };
  assert.throws(
    () => extractor.get(atLimit),
    (error) => error === reachedParser,
  );
  assert.equal(calls, 1);
  assert.throws(
    () =>
      extractor.get({ ...atLimit, hex: atLimit.hex + '00', size: 2_000_001 }),
    /evidence/,
  );
  assert.equal(calls, 1);
});
