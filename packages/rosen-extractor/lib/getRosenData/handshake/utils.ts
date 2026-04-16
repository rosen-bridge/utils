import { HANDSHAKE_NETWORK, MIN_UTXO_VALUE } from './constants';
import {
  DataExtractionOutput,
  HandshakeRpcTxOutput,
  HandshakeTxOutput,
} from './types';
import * as bitcoinLib from 'bitcoinjs-lib';

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
 * Checks if a Handshake output uses the NONE covenant
 * @param output The output to validate
 * @returns true when covenant type is 0
 */
export const hasNoneCovenant = (
  output: HandshakeTxOutput | HandshakeRpcTxOutput,
): boolean => {
  const covenantType = output.covenant.type as number | bigint;
  return (
    (typeof covenantType === 'bigint' ? Number(covenantType) : covenantType) ===
    0
  );
};

/**
 * Extracts data chunks from transaction outputs using value-based ordering
 * Data is encoded in P2WPKH address hashes (version 0, values 1000+)
 * @param outputs - array of outputs with value, address.hash, address.version
 * @param lockAddressIndex - index of the lock address output
 * @returns reconstructedData as string or undefined
 */
export const extractDataFromOutputs = (
  outputs: DataExtractionOutput[],
  lockAddressIndex: number,
): string | undefined => {
  const extractedChunks: Array<{ index: number; data: string }> = [];

  // Extract data chunks step by step
  // Search outputs before lock address (data chunks come before lock output)
  for (let chunkIndex = 0; chunkIndex < 4; chunkIndex++) {
    for (let outputIndex = 0; outputIndex < lockAddressIndex; outputIndex++) {
      const output = outputs[outputIndex];

      if (!output.address || !output.address.hash) continue;

      const value = output.value;
      const addrHash = output.address.hash;
      const version =
        typeof output.address.version === 'bigint'
          ? Number(output.address.version)
          : output.address.version;

      // Check if this output matches the expected chunk
      if (
        value === BigInt(MIN_UTXO_VALUE) + BigInt(chunkIndex) &&
        version === 0 &&
        addrHash.length === 40
      ) {
        extractedChunks.push({
          index: chunkIndex,
          data: addrHash,
        });
        break; // Move to next chunk
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

  return reconstructedData;
};

/**
 * Converts HNS value to dollarydoos (satoshi-equivalent) using string-based arithmetic
 * This avoids floating-point precision errors when converting from HNS decimal format
 * @param value The HNS value as a number (e.g., 0.001, 1.5)
 * @returns The value in dollarydoos as a string (e.g., "1000", "1500000")
 */
export const convertHnsToDollarydoos = (value: number): string => {
  const parts = value.toString().split('.');
  const part1 = ((parts[1] ?? '') + '0'.repeat(6)).substring(0, 6);
  return (parts[0] === '0' ? '' : parts[0]) + part1;
};
