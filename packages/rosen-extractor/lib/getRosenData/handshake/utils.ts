import { decodeAddress } from '@rosen-bridge/address-codec';
import { SUPPORTED_CHAINS } from '../const';
import { HandshakeRosenData } from './types';
import * as bitcoinLib from 'bitcoinjs-lib';

const HANDSHAKE_NETWORK = {
  messagePrefix: '\x18Handshake Signed Message:\n',
  bech32: 'hs',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0,
  scriptHash: 0,
  wif: 0,
};

/**
 * Extracts the hash from a Handshake address using bitcoinjs-lib
 * @param addr The Handshake address to convert
 * @returns The address hash as a hex string
 */
export const addressToHash = (addr: string): string => {
  const outputScript = bitcoinLib.address.toOutputScript(
    addr,
    HANDSHAKE_NETWORK,
  );
  // Output script format for witness v0: OP_0 <length> <hash>
  // We want just the hash part (skip first 2 bytes: OP_0 and length)
  return outputScript.subarray(2).toString('hex');
};

/**
 * Extracts data chunks from transaction outputs using value-based ordering
 * Data is encoded in P2WPKH address hashes (version 0, values 1000+)
 * @param outputs - array of outputs with value, address.hash, address.version
 * @param lockAddressHash - hash of the lock address to identify main output
 * @param minDataValue - minimum value for data outputs (default 1000)
 * @returns object with validLock, lockOutput, and reconstructedData
 */
export const extractDataFromOutputs = (
  outputs: Array<{
    value: number | bigint;
    address?: { hash: string; version?: number };
  }>,
  lockAddressHash: string,
  minDataValue: number = 1000,
): { validLock: boolean; lockOutput?: any; reconstructedData?: string } => {
  let validLock = false;
  let lockOutput: any = undefined;
  const extractedChunks: Array<{ index: number; data: string }> = [];

  for (const output of outputs) {
    if (!output.address || !output.address.hash) continue;

    const valueDollarydoos =
      typeof output.value === 'bigint' ? Number(output.value) : output.value;
    const addrHash = output.address.hash;
    const version =
      typeof output.address.version === 'bigint'
        ? Number(output.address.version)
        : output.address.version;

    // 1. Identify Lock Output (main HNS transfer)
    if (addrHash === lockAddressHash) {
      validLock = true;
      lockOutput = output;
      continue;
    }

    // 2. Identify and extract Data Outputs (P2WPKH version 0)
    // Values ordered as: 1000, 1001, 1002... for extraction
    if (
      valueDollarydoos >= minDataValue &&
      valueDollarydoos < minDataValue + 100
    ) {
      if (version === 0 && addrHash.length === 40) {
        extractedChunks.push({
          index: valueDollarydoos - minDataValue,
          data: addrHash,
        });
      }
    }
  }

  // Reconstruct data by sorting chunks by index
  const reconstructedData =
    extractedChunks.length > 0
      ? extractedChunks
          .sort((a, b) => a.index - b.index)
          .map((chunk) => chunk.data)
          .join('')
      : undefined;

  return {
    validLock,
    lockOutput,
    reconstructedData,
  };
};

/**
 * extracts rosen data from Handshake covenant data
 * In Handshake, RosenData is stored in UPDATE covenant (type 7),
 * and the data is hex-encoded in covenant.items[2]
 * @param dataHex - raw hex data from Handshake UPDATE covenant
 */
export const parseRosenData = (dataHex: string): HandshakeRosenData => {
  // parse toChain
  const toChainHex = dataHex.slice(0, 2);
  const toChainCode = parseInt(toChainHex, 16);
  if (toChainCode >= SUPPORTED_CHAINS.length)
    throw Error(
      `invalid toChain code, found [${toChainCode}] but only [${SUPPORTED_CHAINS.length}] chains are supported`,
    );
  const toChain = SUPPORTED_CHAINS[toChainCode];

  // parse bridgeFee
  const bridgeFeeHex = dataHex.slice(2, 18);
  const bridgeFee = BigInt('0x' + bridgeFeeHex).toString();

  // parse networkFee
  const networkFeeHex = dataHex.slice(18, 34);
  const networkFee = BigInt('0x' + networkFeeHex).toString();

  // parse toAddress
  const addressLengthCode = dataHex.slice(34, 36);
  const addressHex = dataHex.slice(
    36,
    36 + parseInt(addressLengthCode, 16) * 2,
  );
  const toAddress = decodeAddress(toChain, addressHex);

  return {
    toChain,
    toAddress,
    bridgeFee,
    networkFee,
  };
};
