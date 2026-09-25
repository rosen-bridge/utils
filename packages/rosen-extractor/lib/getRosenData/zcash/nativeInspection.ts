import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, fstatSync, openSync, readSync } from 'node:fs';
import { isAbsolute } from 'node:path';

const MAX_RAW_TRANSACTION_BYTES = 2_000_000;
const MAX_REQUEST_BYTES = MAX_RAW_TRANSACTION_BYTES * 2 + 1_024;
// For the pinned pretty-JSON DTO, the densest expansion is a transaction made
// from minimum-size transparent outputs: nine raw bytes can produce at most
// 151 response bytes at six-digit indexes and sixteen-digit zatoshi values.
// ceil(2,000,000 / 9) such entries plus the fixed envelope is below 36 MiB.
const MAX_NATIVE_OUTPUT_BYTES = 36 * 1024 * 1024;
const MAX_COLLECTION_ITEMS = 250_000;
const UINT32_MAX = 0xffff_ffff;
const HASH_BUFFER_BYTES = 64 * 1024;

type JsonRecord = Record<string, unknown>;

export interface NativeVersionInfo {
  kind: 'sprout' | 'v3' | 'v4' | 'v5' | 'v6';
  number: number;
  header: string;
  version_group_id: string;
}

export interface NativeTransparentInput {
  prevout_txid: string;
  prevout_index: number;
  script_sig_hex: string;
  sequence: number;
}

export interface NativeTransparentOutput {
  index: number;
  value_zat: number;
  script_pubkey_hex: string;
  script_kind: string;
}

export interface NativeTransparentSummary {
  present: boolean;
  inputs: NativeTransparentInput[];
  outputs: NativeTransparentOutput[];
}

export interface NativeShieldedSummary {
  present: boolean;
  sprout_joinsplits: number;
  sapling_spends: number;
  sapling_outputs: number;
  orchard_actions: number;
  ironwood_actions: number;
}

export interface NativeInspection {
  txid: string;
  version: NativeVersionInfo;
  consensus_branch_id: string;
  branch_source: 'embedded' | 'context';
  lock_time: number;
  expiry_height: number;
  coinbase: boolean;
  fully_transparent: boolean;
  transparent: NativeTransparentSummary;
  shielded: NativeShieldedSummary;
}

export interface NativeInspectionProvider {
  inspect(rawHex: string, expectedBranchId: string): NativeInspection;
}

export interface NativeZcashInspectorOptions {
  executablePath: string;
  expectedSha256: string;
  timeoutMs?: number;
}

export type NativeInspectionErrorCode =
  | 'invalid_configuration'
  | 'invalid_input'
  | 'executable_unavailable'
  | 'hash_mismatch'
  | 'timeout'
  | 'output_too_large'
  | 'invalid_response'
  | 'native_refusal'
  | 'execution_failed';

export class NativeInspectionError extends Error {
  readonly code: NativeInspectionErrorCode;
  readonly nativeCode?: string;

  constructor(
    code: NativeInspectionErrorCode,
    message: string,
    nativeCode?: string,
  ) {
    super(message);
    this.name = 'NativeInspectionError';
    this.code = code;
    this.nativeCode = nativeCode;
  }
}

function failResponse(): never {
  throw new NativeInspectionError(
    'invalid_response',
    'native inspector returned an invalid response',
  );
}

function record(value: unknown): JsonRecord {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    failResponse();
  }
  return value as JsonRecord;
}

function exactKeys(value: JsonRecord, keys: readonly string[]): void {
  const actual = Object.keys(value);
  if (
    actual.length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key))
  ) {
    failResponse();
  }
}

function text(value: unknown, maxLength: number, pattern?: RegExp): string {
  if (
    typeof value !== 'string' ||
    value.length > maxLength ||
    (pattern !== undefined && !pattern.test(value))
  ) {
    failResponse();
  }
  return value;
}

function canonicalHex(
  value: unknown,
  maxLength: number,
  exactLength?: number,
): string {
  const result = text(value, maxLength, /^(?:[0-9a-f]{2})*$/);
  if (exactLength !== undefined && result.length !== exactLength)
    failResponse();
  return result;
}

function bool(value: unknown): boolean {
  if (typeof value !== 'boolean') failResponse();
  return value;
}

function uint(value: unknown, maximum = Number.MAX_SAFE_INTEGER): number {
  if (
    !Number.isSafeInteger(value) ||
    (value as number) < 0 ||
    (value as number) > maximum
  ) {
    failResponse();
  }
  return value as number;
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value) || value.length > MAX_COLLECTION_ITEMS)
    failResponse();
  return value;
}

function versionInfo(value: unknown): NativeVersionInfo {
  const item = record(value);
  exactKeys(item, ['kind', 'number', 'header', 'version_group_id']);
  const kind = text(
    item.kind,
    6,
    /^(?:sprout|v3|v4|v5|v6)$/,
  ) as NativeVersionInfo['kind'];
  const number = uint(item.number, UINT32_MAX);
  if (
    (kind === 'v3' && number !== 3) ||
    (kind === 'v4' && number !== 4) ||
    (kind === 'v5' && number !== 5) ||
    (kind === 'v6' && number !== 6) ||
    (kind === 'sprout' && number !== 1 && number !== 2)
  ) {
    failResponse();
  }
  return {
    kind,
    number,
    header: canonicalHex(item.header, 8, 8),
    version_group_id: canonicalHex(item.version_group_id, 8, 8),
  };
}

function transparentInput(value: unknown): NativeTransparentInput {
  const item = record(value);
  exactKeys(item, [
    'prevout_txid',
    'prevout_index',
    'script_sig_hex',
    'sequence',
  ]);
  return {
    prevout_txid: canonicalHex(item.prevout_txid, 64, 64),
    prevout_index: uint(item.prevout_index, UINT32_MAX),
    script_sig_hex: canonicalHex(
      item.script_sig_hex,
      MAX_RAW_TRANSACTION_BYTES * 2,
    ),
    sequence: uint(item.sequence, UINT32_MAX),
  };
}

function transparentOutput(
  value: unknown,
  expectedIndex: number,
): NativeTransparentOutput {
  const item = record(value);
  exactKeys(item, ['index', 'value_zat', 'script_pubkey_hex', 'script_kind']);
  const index = uint(item.index);
  if (index !== expectedIndex) failResponse();
  return {
    index,
    value_zat: uint(item.value_zat),
    script_pubkey_hex: canonicalHex(
      item.script_pubkey_hex,
      MAX_RAW_TRANSACTION_BYTES * 2,
    ),
    script_kind: text(item.script_kind, 64, /^[a-z][a-z0-9_-]*$/),
  };
}

function transparentSummary(value: unknown): NativeTransparentSummary {
  const item = record(value);
  exactKeys(item, ['present', 'inputs', 'outputs']);
  const inputs = array(item.inputs).map(transparentInput);
  const outputs = array(item.outputs).map(transparentOutput);
  const present = bool(item.present);
  if (present !== (inputs.length > 0 || outputs.length > 0)) failResponse();
  return { present, inputs, outputs };
}

function shieldedSummary(value: unknown): NativeShieldedSummary {
  const item = record(value);
  exactKeys(item, [
    'present',
    'sprout_joinsplits',
    'sapling_spends',
    'sapling_outputs',
    'orchard_actions',
    'ironwood_actions',
  ]);
  const result: NativeShieldedSummary = {
    present: bool(item.present),
    sprout_joinsplits: uint(item.sprout_joinsplits),
    sapling_spends: uint(item.sapling_spends),
    sapling_outputs: uint(item.sapling_outputs),
    orchard_actions: uint(item.orchard_actions),
    ironwood_actions: uint(item.ironwood_actions),
  };
  const counted =
    result.sprout_joinsplits > 0 ||
    result.sapling_spends > 0 ||
    result.sapling_outputs > 0 ||
    result.orchard_actions > 0 ||
    result.ironwood_actions > 0;
  if (result.present !== counted) failResponse();
  return result;
}

export function validateNativeInspection(value: unknown): NativeInspection {
  const item = record(value);
  exactKeys(item, [
    'txid',
    'version',
    'consensus_branch_id',
    'branch_source',
    'lock_time',
    'expiry_height',
    'coinbase',
    'fully_transparent',
    'transparent',
    'shielded',
  ]);
  const version = versionInfo(item.version);
  const branchSource = text(
    item.branch_source,
    8,
    /^(?:embedded|context)$/,
  ) as NativeInspection['branch_source'];
  if (
    (version.kind === 'v5' || version.kind === 'v6') !==
    (branchSource === 'embedded')
  ) {
    failResponse();
  }
  const transparent = transparentSummary(item.transparent);
  const shielded = shieldedSummary(item.shielded);
  const fullyTransparent = bool(item.fully_transparent);
  if (fullyTransparent === shielded.present) failResponse();
  return {
    txid: canonicalHex(item.txid, 64, 64),
    version,
    consensus_branch_id: canonicalHex(item.consensus_branch_id, 8, 8),
    branch_source: branchSource,
    lock_time: uint(item.lock_time, UINT32_MAX),
    expiry_height: uint(item.expiry_height, UINT32_MAX),
    coinbase: bool(item.coinbase),
    fully_transparent: fullyTransparent,
    transparent,
    shielded,
  };
}

function executableSha256(path: string): string {
  let descriptor: number | undefined;
  let digestHex: string | undefined;
  let failed = false;
  try {
    descriptor = openSync(path, 'r');
    if (!fstatSync(descriptor).isFile()) throw new Error('not a regular file');
    const digest = createHash('sha256');
    const buffer = Buffer.allocUnsafe(HASH_BUFFER_BYTES);
    for (;;) {
      const count = readSync(descriptor, buffer, 0, buffer.length, null);
      if (count === 0) break;
      digest.update(buffer.subarray(0, count));
    }
    digestHex = digest.digest('hex');
  } catch {
    failed = true;
  } finally {
    if (descriptor !== undefined) {
      try {
        closeSync(descriptor);
      } catch {
        failed = true;
      }
    }
  }
  if (failed || digestHex === undefined) {
    throw new NativeInspectionError(
      'executable_unavailable',
      'native inspector executable is unavailable',
    );
  }
  return digestHex;
}

function decodeJson(bytes: Buffer): unknown {
  let source: string;
  try {
    source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return JSON.parse(source) as unknown;
  } catch {
    failResponse();
  }
}

function nativeRefusal(value: unknown): string {
  const item = record(value);
  exactKeys(item, ['code', 'message']);
  const code = text(item.code, 64, /^[a-z][a-z0-9_]*$/);
  text(item.message, 1_024, /^.+$/s);
  return code;
}

interface ChildFailure {
  code?: unknown;
  status?: unknown;
  stdout?: unknown;
  stderr?: unknown;
}

function childFailure(error: unknown): ChildFailure {
  return typeof error === 'object' && error !== null
    ? (error as ChildFailure)
    : {};
}

export class NativeZcashInspector implements NativeInspectionProvider {
  private readonly executablePath: string;
  private readonly expectedSha256: string;
  private readonly timeoutMs: number;

  constructor(options: NativeZcashInspectorOptions) {
    if (
      typeof options !== 'object' ||
      options === null ||
      typeof options.executablePath !== 'string' ||
      !isAbsolute(options.executablePath) ||
      typeof options.expectedSha256 !== 'string' ||
      !/^[0-9a-f]{64}$/.test(options.expectedSha256)
    ) {
      throw new NativeInspectionError(
        'invalid_configuration',
        'native inspector configuration is invalid',
      );
    }
    const timeoutMs = options.timeoutMs ?? 10_000;
    if (
      !Number.isSafeInteger(timeoutMs) ||
      timeoutMs <= 0 ||
      timeoutMs > 2_147_483_647
    ) {
      throw new NativeInspectionError(
        'invalid_configuration',
        'native inspector timeout is invalid',
      );
    }
    this.executablePath = options.executablePath;
    this.expectedSha256 = options.expectedSha256;
    this.timeoutMs = timeoutMs;
  }

  inspect(rawHex: string, expectedBranchId: string): NativeInspection {
    if (
      typeof rawHex !== 'string' ||
      rawHex.length === 0 ||
      rawHex.length > MAX_RAW_TRANSACTION_BYTES * 2 ||
      rawHex.length % 2 !== 0 ||
      !/^[0-9a-f]+$/.test(rawHex) ||
      typeof expectedBranchId !== 'string' ||
      !/^[0-9a-f]{8}$/.test(expectedBranchId)
    ) {
      throw new NativeInspectionError(
        'invalid_input',
        'native inspection input is invalid',
      );
    }
    const request = Buffer.from(
      JSON.stringify({
        raw_tx_hex: rawHex,
        expected_branch_id: expectedBranchId,
      }),
      'utf8',
    );
    if (request.length > MAX_REQUEST_BYTES) {
      throw new NativeInspectionError(
        'invalid_input',
        'native inspection input is too large',
      );
    }

    // This per-call digest detects ordinary binary drift. It does not make the
    // path lookup and subsequent process creation an atomic filesystem action.
    if (executableSha256(this.executablePath) !== this.expectedSha256) {
      throw new NativeInspectionError(
        'hash_mismatch',
        'native inspector executable hash mismatch',
      );
    }

    let output: Buffer;
    try {
      output = execFileSync(this.executablePath, [], {
        input: request,
        maxBuffer: MAX_NATIVE_OUTPUT_BYTES,
        timeout: this.timeoutMs,
        windowsHide: true,
        shell: false,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (error: unknown) {
      const failure = childFailure(error);
      if (failure.code === 'ETIMEDOUT') {
        throw new NativeInspectionError(
          'timeout',
          'native inspector timed out',
        );
      }
      if (
        failure.code === 'ENOBUFS' ||
        failure.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER'
      ) {
        throw new NativeInspectionError(
          'output_too_large',
          'native inspector output exceeded its limit',
        );
      }
      if (
        failure.code === 'ENOENT' ||
        failure.code === 'EACCES' ||
        failure.code === 'EPERM'
      ) {
        throw new NativeInspectionError(
          'executable_unavailable',
          'native inspector executable is unavailable',
        );
      }
      if (
        failure.status === 1 &&
        Buffer.isBuffer(failure.stderr) &&
        (!Buffer.isBuffer(failure.stdout) ||
          failure.stdout.toString('utf8').trim() === '')
      ) {
        try {
          const nativeCode = nativeRefusal(decodeJson(failure.stderr));
          throw new NativeInspectionError(
            'native_refusal',
            'native inspector refused the transaction',
            nativeCode,
          );
        } catch (refusalError: unknown) {
          if (
            refusalError instanceof NativeInspectionError &&
            refusalError.code === 'native_refusal'
          )
            throw refusalError;
          throw new NativeInspectionError(
            'invalid_response',
            'native inspector returned an invalid refusal',
          );
        }
      }
      throw new NativeInspectionError(
        'execution_failed',
        'native inspector execution failed',
      );
    }

    const inspection = validateNativeInspection(decodeJson(output));
    if (inspection.consensus_branch_id !== expectedBranchId) failResponse();
    return inspection;
  }
}
