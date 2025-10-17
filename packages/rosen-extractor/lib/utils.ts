import { decodeAddress } from '@rosen-bridge/address-codec';
import { SUPPORTED_CHAINS } from './getRosenData/const';
import { MinimalOnChainRosenData } from './types';

/**
 * extracts rosen data from raw hex data
 * @param scriptPubKeyHex
 */
export const parseRosenData = (
  scriptPubKeyHex: string,
): MinimalOnChainRosenData => {
  // parse toChain
  const toChainHex = scriptPubKeyHex.slice(0, 2);
  const toChainCode = parseInt(toChainHex, 16);
  if (toChainCode >= SUPPORTED_CHAINS.length)
    throw Error(
      `invalid toChain code, found [${toChainCode}] but only [${SUPPORTED_CHAINS.length}] chains are supported`,
    );
  const toChain = SUPPORTED_CHAINS[toChainCode];

  // parse bridgeFee
  const bridgeFeeHex = scriptPubKeyHex.slice(2, 18);
  const bridgeFee = BigInt('0x' + bridgeFeeHex).toString();

  // parse networkFee
  const networkFeeHex = scriptPubKeyHex.slice(18, 34);
  const networkFee = BigInt('0x' + networkFeeHex).toString();

  // parse toAddress
  const addressLengthCode = scriptPubKeyHex.slice(34, 36);
  const addressHex = scriptPubKeyHex.slice(
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

import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import { Buffer } from 'buffer';

function jsonToMetadatum(obj: any): wasm.TransactionMetadatum {
  if (obj === null || obj === undefined) {
    return wasm.TransactionMetadatum.new_text('');
  }

  if (typeof obj === 'string') {
    return wasm.TransactionMetadatum.new_text(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'bigint') {
    return wasm.TransactionMetadatum.new_int(
      wasm.Int.new(wasm.BigNum.from_str(obj.toString())),
    );
  }

  if (Array.isArray(obj)) {
    const arr = wasm.MetadataList.new();
    obj.forEach((v) => arr.add(jsonToMetadatum(v)));
    return wasm.TransactionMetadatum.new_list(arr);
  }

  if (typeof obj === 'object') {
    const map = wasm.MetadataMap.new();
    for (const [key, value] of Object.entries(obj)) {
      map.insert(jsonToMetadatum(key), jsonToMetadatum(value));
    }
    return wasm.TransactionMetadatum.new_map(map);
  }

  throw new Error('Unsupported metadata type: ' + typeof obj);
}

export function metadataArrayToCborHex(
  items: {
    label: string;
    json_metadata: string | Record<string, unknown>;
  }[],
): string {
  const metadata = wasm.GeneralTransactionMetadata.new();

  for (const { label, json_metadata } of items) {
    const key = wasm.BigNum.from_str(label);
    const value =
      typeof json_metadata === 'string'
        ? wasm.TransactionMetadatum.new_text(json_metadata)
        : jsonToMetadatum(json_metadata);

    metadata.insert(key, value);
  }

  return Buffer.from(metadata.to_bytes()).toString('hex');
}
