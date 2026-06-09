import { address } from 'bitcoinjs-lib';

import { MinimalOnChainRosenData } from '../../types';
import { parseRosenData } from '../../utils';

const OP_RETURN = 0x6a;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const OP_PUSHDATA4 = 0x4e;
const MAX_OP_RETURN_DATA_BYTES = 80;

const firoNetwork = {
  // Firo network parameters
  messagePrefix: '\x19Firo Signed Message:\n',
  bech32: 'firo',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x52, // Firo mainnet uses 0x52 (a addresses), testnet uses 0x41 (T addresses)
  scriptHash: 0x07,
  wif: 0xd2,
};

/**
 * Extracts Rosen OP_RETURN payload from a Firo scriptPubKey.
 *
 * Supports direct push and OP_PUSHDATA1/2/4 encodings while enforcing Rosen's
 * 80-byte OP_RETURN payload limit.
 *
 * @param scriptPubKeyHex Firo scriptPubKey hex
 * @returns OP_RETURN payload hex
 */
const parseOpReturnData = (scriptPubKeyHex: string): string => {
  if (scriptPubKeyHex.length % 2 !== 0) throw Error(`script hex length is odd`);

  const scriptLength = scriptPubKeyHex.length / 2;
  let offset = 0;

  const readBytes = (length: number) => {
    if (offset + length > scriptLength)
      throw Error(
        `script length is unexpected [${offset + length} > ${scriptLength}]`,
      );

    const result = scriptPubKeyHex.slice(offset * 2, (offset + length) * 2);
    offset += length;
    return result;
  };

  const opcode = parseInt(readBytes(1), 16);
  if (opcode !== OP_RETURN)
    throw Error(`script does not start with OP_RETURN opcode (6a)`);

  const pushOpcode = parseInt(readBytes(1), 16);
  let dataLength: number;
  if (pushOpcode < OP_PUSHDATA1) {
    dataLength = pushOpcode;
  } else if (pushOpcode === OP_PUSHDATA1) {
    dataLength = parseInt(readBytes(1), 16);
  } else if (pushOpcode === OP_PUSHDATA2) {
    dataLength = Buffer.from(readBytes(2), 'hex').readUInt16LE();
  } else if (pushOpcode === OP_PUSHDATA4) {
    dataLength = Buffer.from(readBytes(4), 'hex').readUInt32LE();
  } else {
    throw Error(`script contains unsupported push opcode [${pushOpcode}]`);
  }

  if (dataLength > MAX_OP_RETURN_DATA_BYTES)
    throw Error(
      `OP_RETURN data length exceeds Rosen limit [${dataLength} > ${MAX_OP_RETURN_DATA_BYTES}]`,
    );

  const expectedScriptLength = offset + dataLength;
  if (Number.isNaN(dataLength) || expectedScriptLength !== scriptLength)
    throw Error(
      `script length is unexpected [${expectedScriptLength} !== ${scriptLength}]`,
    );

  return readBytes(dataLength);
};

/**
 * Converts a Firocoin address to its corresponding output script
 * @param addr The Firocoin address to convert
 * @returns The output script as a hex string
 */
export const addressToOutputScript = (addr: string): string => {
  try {
    return address.toOutputScript(addr, firoNetwork).toString('hex');
  } catch (e) {
    throw new Error(
      `Failed to convert Firo address to output script: ${e}. Only transparent addresses (P2PKH, P2SH) are supported. Privacy addresses (RAP, Spark, Lelantus) are not supported.`,
    );
  }
};

/**
 * extracts rosen data from OP_RETURN box script pub key
 * @param scriptPubKeyHex
 */
export const parseOpReturn = (
  scriptPubKeyHex: string,
): MinimalOnChainRosenData => {
  return parseRosenData(parseOpReturnData(scriptPubKeyHex));
};
