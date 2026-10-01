import { Output } from '@bitauth/libauth';

import { MinimalOnChainRosenData } from '../../types';
import { parseRosenData } from '../../utils';
import { BitcoinCashRpcTxOutput } from './types';

export const MAX_BITCOIN_CASH_TRANSACTION_BYTES = 1_000_000;
export const MAX_BITCOIN_CASH_TRANSACTION_IO = 4096;
export const MAX_BITCOIN_CASH_OP_RETURN_PAYLOAD_BYTES = 80;
const MAX_UINT64 = 0xffffffffffffffffn;

export const isHex = (value: unknown): value is string =>
  typeof value === 'string' && /^(?:[0-9a-fA-F]{2})+$/.test(value);

/** Parses exactly one canonical push with an exact-length Rosen payload. */
export const decodeBitcoinCashOpReturnPayload = (scriptHex: string): Buffer => {
  if (!isHex(scriptHex) || scriptHex.length > 166)
    throw Error('Invalid or oversized OP_RETURN script');
  const script = Buffer.from(scriptHex, 'hex');
  if (script[0] !== 0x6a) throw Error('OP_RETURN opcode required');
  const opcode = script[1];
  const offset = opcode === 0x4c ? 3 : 2;
  const length = opcode === 0x4c ? script[2] : opcode;
  if (
    length === undefined ||
    length < 18 ||
    length > MAX_BITCOIN_CASH_OP_RETURN_PAYLOAD_BYTES ||
    (opcode === 0x4c ? length < 76 : opcode > 75) ||
    script.length !== offset + length
  )
    throw Error('Expected one canonical bounded data push');
  return script.subarray(offset);
};

export const parseBitcoinCashOpReturn = (
  scriptHex: string,
): MinimalOnChainRosenData => {
  const payload = decodeBitcoinCashOpReturnPayload(scriptHex);
  if (payload.length !== 18 + payload[17])
    throw Error('Rosen address length does not consume the payload');
  return parseRosenData(payload.toString('hex'));
};

/** Converts RPC decimal text exactly, including JSON number exponent notation. */
export const bitcoinCashValueToSatoshis = (value: number | string): bigint => {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    String(value).length > 128
  )
    throw Error('Invalid or oversized BCH amount');
  if (typeof value === 'number' && !Number.isFinite(value))
    throw Error('Non-finite BCH amount');
  const match = /^(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(String(value));
  if (!match) throw Error('Invalid BCH decimal amount');
  const fraction = match[2] ?? '';
  const exponent = Number(match[3] ?? 0);
  const shift = 8 + exponent - fraction.length;
  if (!Number.isSafeInteger(exponent) || Math.abs(shift) > 32)
    throw Error('BCH amount exponent outside uint64 range');
  const digits = BigInt(match[1] + fraction);
  const amount =
    shift >= 0 ? digits * 10n ** BigInt(shift) : digits / 10n ** BigInt(-shift);
  if (shift < 0 && digits % 10n ** BigInt(-shift) !== 0n)
    throw Error('Fractional satoshi amount');
  if (amount > MAX_UINT64) throw Error('BCH amount exceeds uint64');
  return amount;
};

/** Omitted token metadata never hides a token decoded from raw bytes. */
export const bitcoinCashOutputMatchesRpc = (
  output: Output,
  rpc: BitcoinCashRpcTxOutput,
  index: number,
): boolean => {
  if (
    rpc.n !== index ||
    typeof rpc.scriptPubKey.hex !== 'string' ||
    !/^(?:[0-9a-fA-F]{2})*$/.test(rpc.scriptPubKey.hex) ||
    Buffer.from(output.lockingBytecode).toString('hex') !==
      rpc.scriptPubKey.hex.toLowerCase() ||
    bitcoinCashValueToSatoshis(rpc.value) !== output.valueSatoshis
  )
    return false;
  if (rpc.tokenData === undefined) return true;
  if (!output.token) return rpc.tokenData === null;
  const metadata = rpc.tokenData;
  if (
    !metadata ||
    metadata.category.toLowerCase() !==
      Buffer.from(output.token.category).toString('hex') ||
    metadata.amount !== output.token.amount.toString() ||
    Boolean(metadata.nft) !== Boolean(output.token.nft)
  )
    return false;
  return (
    !output.token.nft ||
    (metadata.nft?.capability === output.token.nft.capability &&
      metadata.nft.commitment.toLowerCase() ===
        Buffer.from(output.token.nft.commitment).toString('hex'))
  );
};
