import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  decodeErgoAddress,
  validateErgoAddress,
} from '@rosen-bridge/address-codec-ergo';
import {
  createZcashAddressCodec,
  type ZcashNetwork,
} from '@rosen-bridge/address-codec-zcash';
import type { TokenMap } from '@rosen-bridge/tokens';

import { parseRosenData } from '../../utils';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import type { RosenData } from '../abstract/types';
import type { NativeInspectionProvider } from './nativeInspection.js';

/** Structural RPC envelope; this package does not depend on a scanner. */
export interface ZcashRpcTransaction extends Record<string, unknown> {
  txid: string;
  hex: string;
  size: number;
  blockhash: string;
  height: number;
}

export interface ZcashRpcRosenExtractorOptions {
  network: ZcashNetwork;
  lockAddress: string;
  tokens: TokenMap;
  inspector: NativeInspectionProvider;
  branchIdAtHeight: (height: number) => string;
  logger?: AbstractLogger;
  storeRawData?: boolean;
}

export class ZcashExtractionError extends Error {
  constructor(readonly code: 'configuration' | 'evidence' | 'identity') {
    super('Zcash extraction ' + code + ' failure');
    this.name = 'ZcashExtractionError';
  }
}

function configuration(): never {
  throw new ZcashExtractionError('configuration');
}

/** One minimal push, with an exact Rosen payload. No trailing script or payload bytes. */
function metadata(scriptHex: string): Buffer | undefined {
  const script = Buffer.from(scriptHex, 'hex');
  if (script.length < 2 || script[0] !== 0x6a) return undefined;
  let offset = 2;
  let length = script[1];
  if (length === 0x4c) {
    offset = 3;
    length = script[2];
    if (length < 76) return undefined;
  } else if (length < 1 || length > 75) return undefined;
  if (length > 80 || script.length !== offset + length) return undefined;
  const payload = script.subarray(offset);
  // Initial destination is Rosen chain index 0 (Ergo), using a compressed P2PK key.
  if (
    payload.length !== 51 ||
    payload[0] !== 0 ||
    payload[17] !== 33 ||
    (payload[18] !== 2 && payload[18] !== 3)
  )
    return undefined;
  return payload;
}

export class ZcashRpcRosenExtractor extends AbstractRosenDataExtractor<ZcashRpcTransaction> {
  readonly chain = 'zcash';
  private readonly lockScript: string;
  private readonly inspector: NativeInspectionProvider;
  private readonly branchIdAtHeight: (height: number) => string;
  private inGet = false;
  private producedCandidate = false;

  constructor(options: ZcashRpcRosenExtractorOptions) {
    super(
      options.lockAddress,
      options.tokens,
      options.logger,
      options.storeRawData,
    );
    this.lockScript = createZcashAddressCodec(options.network).parseAddress(
      options.lockAddress,
    ).scriptPubKeyHex;
    this.inspector = options.inspector;
    this.branchIdAtHeight = options.branchIdAtHeight;
    if (
      typeof this.inspector?.inspect !== 'function' ||
      typeof this.branchIdAtHeight !== 'function'
    )
      configuration();

    // Preserve the published Rosen get implementation, while making its broad
    // validator catch fail closed for an independently validated candidate.
    const rosenGet = this.get;
    this.get = (transaction) => {
      if (this.inGet) configuration();
      this.inGet = true;
      this.producedCandidate = false;
      try {
        const data = rosenGet(transaction);
        if (this.producedCandidate && data === undefined) configuration();
        return data;
      } finally {
        this.inGet = false;
        this.producedCandidate = false;
      }
    };
  }

  private targetToken(): string {
    // TokenMap searches every chain, including unbridgeable sets, for this ID.
    // Validate that exact selection before base.get can round the source amount.
    const matches = this.tokens
      .getRawConfig()
      .filter((set) =>
        Object.values(set).some((token) => token.tokenId === 'zec'),
      );
    if (matches.length !== 1) configuration();
    const set = matches[0];
    if (
      set.zcash?.tokenId !== 'zec' ||
      set.zcash.decimals !== 8 ||
      !/^[0-9a-f]{64}$/.test(set.ergo?.tokenId ?? '') ||
      set.ergo.decimals !== 8 ||
      Object.values(set).some(
        (token) =>
          !Number.isSafeInteger(token.decimals) ||
          token.decimals < 8 ||
          token.decimals > 18,
      )
    )
      configuration();
    return set.ergo.tokenId;
  }

  extractData = (transaction: ZcashRpcTransaction): RosenData | undefined => {
    const targetChainTokenId = this.targetToken();
    if (
      typeof transaction !== 'object' ||
      transaction === null ||
      typeof transaction.hex !== 'string' ||
      transaction.hex.length === 0 ||
      transaction.hex.length > 4_000_000 ||
      !/^(?:[0-9a-f]{2})+$/.test(transaction.hex) ||
      !Number.isSafeInteger(transaction.size) ||
      transaction.size !== transaction.hex.length / 2 ||
      typeof transaction.txid !== 'string' ||
      !/^[0-9a-f]{64}$/.test(transaction.txid) ||
      typeof transaction.blockhash !== 'string' ||
      !/^[0-9a-f]{64}$/.test(transaction.blockhash) ||
      !Number.isSafeInteger(transaction.height) ||
      transaction.height < 0
    ) {
      throw new ZcashExtractionError('evidence');
    }
    const branchId = this.branchIdAtHeight(transaction.height);
    if (typeof branchId !== 'string' || !/^[0-9a-f]{8}$/.test(branchId))
      configuration();
    // NativeInspectionProvider is a trusted parsing boundary. Production uses
    // NativeZcashInspector with its pinned executable and strict DTO validation.
    const native = this.inspector.inspect(transaction.hex, branchId);
    if (
      native.txid !== transaction.txid ||
      native.consensus_branch_id !== branchId
    ) {
      throw new ZcashExtractionError('identity');
    }
    if (
      native.coinbase ||
      !native.fully_transparent ||
      !native.transparent.present
    )
      return undefined;
    const reserve = native.transparent.outputs.filter(
      (output) => output.script_pubkey_hex === this.lockScript,
    );
    const markers = native.transparent.outputs.filter((output) =>
      output.script_pubkey_hex.startsWith('6a'),
    );
    if (
      reserve.length !== 1 ||
      markers.length !== 1 ||
      reserve[0].value_zat <= 0 ||
      markers[0].value_zat !== 0 ||
      native.transparent.inputs.length === 0
    )
      return undefined;
    const payload = metadata(markers[0].script_pubkey_hex);
    if (payload === undefined) return undefined;
    let toAddress: string;
    try {
      toAddress = decodeErgoAddress(payload.subarray(18).toString('hex'));
      validateErgoAddress(toAddress);
    } catch {
      // Bounded input to the pinned, pure Ergo P2PK codec: invalid destination.
      return undefined;
    }
    let rosen: ReturnType<typeof parseRosenData>;
    try {
      rosen = parseRosenData(payload.toString('hex'));
    } catch {
      configuration();
    }
    if (rosen.toChain !== 'ergo' || rosen.toAddress !== toAddress)
      configuration();
    const input = native.transparent.inputs[0];
    const result: RosenData = {
      ...rosen,
      fromAddress: `box:${input.prevout_txid}.${input.prevout_index}`,
      sourceChainTokenId: 'zec',
      amount: BigInt(reserve[0].value_zat).toString(),
      targetChainTokenId,
      sourceTxId: native.txid,
      rawData: markers[0].script_pubkey_hex,
    };
    this.producedCandidate = true;
    return result;
  };
}
