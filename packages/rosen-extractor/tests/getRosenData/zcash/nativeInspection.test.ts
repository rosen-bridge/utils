/* eslint vitest/no-import-node-test: off -- the pinned native suite runs with node:test. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  NativeInspectionError,
  NativeZcashInspector,
  validateNativeInspection,
  type NativeInspection,
} from '../../../lib/getRosenData/zcash/nativeInspection.js';

const EXPECTED_FIXTURE_SHA256 =
  '458a2bbbfb9a6a5ae8f232300b1b72d2d11628a04d55888dcbc38dcb0c0fa17c';
const BRANCH_ID = 'c2d6d0b4';

const executablePath = process.env.ZCASH_INSPECTOR_BIN;
const executableSha256 = process.env.ZCASH_INSPECTOR_SHA256;
if (executablePath === undefined || executableSha256 === undefined) {
  throw new Error(
    'ZCASH_INSPECTOR_BIN and ZCASH_INSPECTOR_SHA256 are required',
  );
}
assert.match(executableSha256, /^[0-9a-f]{64}$/);

interface DeliveredTransaction {
  hex: string;
  txid: string;
}

interface DeliveredBlock {
  transactions: DeliveredTransaction[];
}

const fixtureBytes = readFileSync(
  new URL('./fixtures/native-delivered-block-106.json', import.meta.url),
);
assert.equal(
  createHash('sha256').update(fixtureBytes).digest('hex'),
  EXPECTED_FIXTURE_SHA256,
);
const delivered = JSON.parse(fixtureBytes.toString('utf8')) as DeliveredBlock;
assert.equal(delivered.transactions.length, 2);
const [coinbase, deposit] = delivered.transactions;
assert.ok(coinbase);
assert.ok(deposit);

const inspector = new NativeZcashInspector({
  executablePath,
  expectedSha256: executableSha256,
});

function validInspection(): NativeInspection {
  return {
    txid: 'a'.repeat(64),
    version: {
      kind: 'v5',
      number: 5,
      header: '80000005',
      version_group_id: '26a7270a',
    },
    consensus_branch_id: BRANCH_ID,
    branch_source: 'embedded',
    lock_time: 0,
    expiry_height: 305,
    coinbase: false,
    fully_transparent: true,
    transparent: {
      present: true,
      inputs: [
        {
          prevout_txid: 'b'.repeat(64),
          prevout_index: 1,
          script_sig_hex: '00',
          sequence: 0xffff_fffe,
        },
      ],
      outputs: [
        {
          index: 0,
          value_zat: 100_000_000,
          script_pubkey_hex: '76a914' + 'c'.repeat(40) + '88ac',
          script_kind: 'pubkeyhash',
        },
      ],
    },
    shielded: {
      present: false,
      sprout_joinsplits: 0,
      sapling_spends: 0,
      sapling_outputs: 0,
      orchard_actions: 0,
      ironwood_actions: 0,
    },
  };
}

function expectCode(
  action: () => unknown,
  code: NativeInspectionError['code'],
): NativeInspectionError {
  let caught: unknown;
  try {
    action();
  } catch (error: unknown) {
    caught = error;
  }
  assert.ok(caught instanceof NativeInspectionError);
  assert.equal(caught.code, code);
  return caught;
}

function compactSize(value: number): string {
  assert.ok(Number.isSafeInteger(value) && value >= 0 && value <= 0xffff_ffff);
  if (value < 253) return value.toString(16).padStart(2, '0');
  const encoded = Buffer.alloc(value <= 0xffff ? 3 : 5);
  if (value <= 0xffff) {
    encoded[0] = 0xfd;
    encoded.writeUInt16LE(value, 1);
  } else {
    encoded[0] = 0xfe;
    encoded.writeUInt32LE(value, 1);
  }
  return encoded.toString('hex');
}

function denseTransparentTransaction(outputCount: number): string {
  const value = Buffer.alloc(8);
  value.writeBigUInt64LE(2_100_000_000_000_000n);
  return [
    '05000080', // V5 header
    '0a27a726', // V5 version group, little endian
    'b4d0d6c2', // NU5 branch, little endian
    '00000000', // lock time
    '00000000', // expiry height
    '00', // no transparent inputs
    compactSize(outputCount),
    `${value.toString('hex')}00`.repeat(outputCount), // value plus empty script
    '000000', // empty Sapling spends/outputs and Orchard actions
  ].join('');
}

function pinnedDenseResponseBytes(outputCount: number): number {
  assert.ok(outputCount > 0);
  let indexDigits = 0;
  for (let index = 0; index < outputCount; index += 1) {
    indexDigits += index.toString().length;
  }
  // 611 bytes is the pinned pretty response with an empty output array. The
  // expanded array adds three framing bytes, then 145 bytes plus index digits
  // for each empty-script output carrying a sixteen-digit zatoshi value.
  return 611 + 3 + 145 * outputCount + indexDigits;
}

function fileSha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

test('strict validator preserves the reviewed response field names and values', () => {
  const value = validInspection();
  assert.deepEqual(validateNativeInspection(value), value);
});

test('strict validator rejects malformed and oversized native responses', () => {
  const alias = structuredClone(validInspection()) as NativeInspection & {
    version: NativeInspection['version'] & { versionGroupId?: string };
  };
  alias.version.versionGroupId = alias.version.version_group_id;
  delete (alias.version as Partial<NativeInspection['version']>)
    .version_group_id;
  expectCode(() => validateNativeInspection(alias), 'invalid_response');

  const uppercaseHash = structuredClone(validInspection());
  uppercaseHash.txid = uppercaseHash.txid.toUpperCase();
  expectCode(() => validateNativeInspection(uppercaseHash), 'invalid_response');

  const unsafeAmount = structuredClone(validInspection());
  unsafeAmount.transparent.outputs[0]!.value_zat = Number.MAX_SAFE_INTEGER + 1;
  expectCode(() => validateNativeInspection(unsafeAmount), 'invalid_response');

  const wrongIndex = structuredClone(validInspection());
  wrongIndex.transparent.outputs[0]!.index = 1;
  expectCode(() => validateNativeInspection(wrongIndex), 'invalid_response');

  const oversizedScript = structuredClone(validInspection());
  oversizedScript.transparent.outputs[0]!.script_pubkey_hex = '00'.repeat(
    2_000_001,
  );
  expectCode(
    () => validateNativeInspection(oversizedScript),
    'invalid_response',
  );
});

test('constructor and request bounds fail with typed path-free errors', () => {
  expectCode(
    () =>
      new NativeZcashInspector({
        executablePath: 'relative.exe',
        expectedSha256: executableSha256,
      }),
    'invalid_configuration',
  );
  expectCode(
    () =>
      new NativeZcashInspector({
        executablePath,
        expectedSha256: executableSha256,
        timeoutMs: 0,
      }),
    'invalid_configuration',
  );
  expectCode(() => inspector.inspect('AA', BRANCH_ID), 'invalid_input');
  expectCode(() => inspector.inspect('00', 'C2D6D0B4'), 'invalid_input');

  const missingPath = join(
    tmpdir(),
    `missing-native-inspector-${process.pid}.exe`,
  );
  const unavailable = expectCode(
    () =>
      new NativeZcashInspector({
        executablePath: missingPath,
        expectedSha256: executableSha256,
      }).inspect('00', BRANCH_ID),
    'executable_unavailable',
  );
  assert.equal(unavailable.message.includes(missingPath), false);
});

test('actual pinned inspector decodes the public coinbase and deposit fixture', () => {
  const coinbaseResult = inspector.inspect(coinbase.hex, BRANCH_ID);
  assert.equal(coinbaseResult.txid, coinbase.txid);
  assert.equal(coinbaseResult.coinbase, true);
  assert.equal(
    coinbaseResult.transparent.inputs[0]?.prevout_txid,
    '0'.repeat(64),
  );
  assert.equal(
    coinbaseResult.transparent.inputs[0]?.prevout_index,
    0xffff_ffff,
  );
  assert.equal(coinbaseResult.transparent.outputs[0]?.value_zat, 625_020_000);
  assert.equal(
    coinbaseResult.transparent.outputs[0]?.script_kind,
    'scripthash',
  );

  const depositResult = inspector.inspect(deposit.hex, BRANCH_ID);
  assert.equal(depositResult.txid, deposit.txid);
  assert.equal(depositResult.coinbase, false);
  assert.equal(depositResult.fully_transparent, true);
  assert.deepEqual(
    depositResult.transparent.outputs.map((output) => output.value_zat),
    [100_000_000, 424_950_000, 0],
  );
  assert.deepEqual(
    depositResult.transparent.outputs.map((output) => output.script_kind),
    ['pubkeyhash', 'pubkeyhash', 'nulldata'],
  );
  assert.equal(
    depositResult.transparent.outputs[0]?.script_pubkey_hex,
    '76a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac',
  );
});

test('actual pinned inspector preserves a near-limit output-dense transaction', () => {
  const outputCount = 222_000;
  const raw = denseTransparentTransaction(outputCount);
  assert.equal(Buffer.from(raw, 'hex').length, 1_998_029);
  assert.equal(pinnedDenseResponseBytes(outputCount), 33_411_504);
  assert.ok(pinnedDenseResponseBytes(outputCount) > 16 * 1024 * 1024);

  const result = inspector.inspect(raw, BRANCH_ID);
  assert.equal(result.transparent.inputs.length, 0);
  assert.equal(result.transparent.outputs.length, outputCount);
  assert.deepEqual(result.transparent.outputs[0], {
    index: 0,
    value_zat: 2_100_000_000_000_000,
    script_pubkey_hex: '',
    script_kind: 'nonstandard',
  });
  assert.deepEqual(result.transparent.outputs.at(-1), {
    index: outputCount - 1,
    value_zat: 2_100_000_000_000_000,
    script_pubkey_hex: '',
    script_kind: 'nonstandard',
  });
});

test('native refusal is typed without copying its raw error payload', () => {
  const refusal = expectCode(
    () => inspector.inspect('00', BRANCH_ID),
    'native_refusal',
  );
  assert.equal(refusal.nativeCode, 'truncated_transaction');
  assert.equal(refusal.message, 'native inspector refused the transaction');
  assert.equal(refusal.message.includes('transaction ended'), false);
});

test('executable hash is checked again before every process execution', () => {
  const temporaryExecutable = join(
    tmpdir(),
    `native-inspector-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.exe`,
  );
  copyFileSync(executablePath, temporaryExecutable);
  try {
    const temporaryInspector = new NativeZcashInspector({
      executablePath: temporaryExecutable,
      expectedSha256: executableSha256,
    });
    assert.equal(
      temporaryInspector.inspect(deposit.hex, BRANCH_ID).txid,
      deposit.txid,
    );
    appendFileSync(temporaryExecutable, Buffer.from([0]));
    expectCode(
      () => temporaryInspector.inspect(deposit.hex, BRANCH_ID),
      'hash_mismatch',
    );
  } finally {
    unlinkSync(temporaryExecutable);
  }
});

test('actual child timeout and stdout overflow are classified', () => {
  const stem = join(
    tmpdir(),
    `native-inspector-helper-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const sourcePath = `${stem}.rs`;
  const helperPath = `${stem}.exe`;
  const helperPdbPath = `${stem}.pdb`;
  writeFileSync(
    sourcePath,
    String.raw`
use std::{io::{self, Read, Write}, thread, time::Duration};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    if input.contains("\"raw_tx_hex\":\"00\"") {
        thread::sleep(Duration::from_secs(5));
        return;
    }
    let block = vec![b'x'; 1024 * 1024];
    let mut stdout = io::stdout().lock();
    for _ in 0..37 {
        stdout.write_all(&block).unwrap();
    }
  }
`,
  );

  try {
    execFileSync(
      process.env.RUSTC ?? 'rustc',
      [sourcePath, '-C', 'debuginfo=0', '-O', '-o', helperPath],
      { shell: false, windowsHide: true },
    );
    const helperSha256 = fileSha256(helperPath);

    const timeoutInspector = new NativeZcashInspector({
      executablePath: helperPath,
      expectedSha256: helperSha256,
      timeoutMs: 50,
    });
    expectCode(() => timeoutInspector.inspect('00', BRANCH_ID), 'timeout');

    const overflowInspector = new NativeZcashInspector({
      executablePath: helperPath,
      expectedSha256: helperSha256,
    });
    expectCode(
      () => overflowInspector.inspect('01', BRANCH_ID),
      'output_too_large',
    );
  } finally {
    for (const path of [sourcePath, helperPath, helperPdbPath]) {
      if (existsSync(path)) unlinkSync(path);
    }
  }
});
