import { decodeAddress } from '@rosen-bridge/address-codec';
import { SUPPORTED_CHAINS } from '../const';
import { OpReturnData } from './types';
import * as bitcoinLib from 'bitcoinjs-lib';

const HANDSHAKE_NETWORK = {
  messagePrefix: '\x18Handshake Signed Message:\n',
  bech32: 'hs',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x28,
  wif: 0x80,
};

/**
 * Extracts the hash from a Handshake address using bitcoinjs-lib
 * @param addr The Handshake address to convert
 * @returns The address hash as a hex string
 */
export const addressToHash = (addr: string): string => {
  const outputScript = bitcoinLib.address.toOutputScript(addr, HANDSHAKE_NETWORK);
  // Output script format for witness v0: OP_0 <length> <hash>
  // We want just the hash part (skip first 2 bytes: OP_0 and length)
  return outputScript.subarray(2).toString('hex');
};

/**
 * extracts rosen data from Handshake address hash
 * In Handshake, OP_RETURN data is stored in outputs with address.version === 31,
 * and the data is hex-encoded in the address.hash field (no OP_RETURN opcode prefix)
 * @param dataHex - raw hex data from Handshake address.hash
 */
export const parseRosenData = (dataHex: string): OpReturnData => {
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
