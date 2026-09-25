import base58check from 'bs58check';

import {
  UnsupportedZcashAddressError,
  type TransparentP2pkhRecipient,
  type ZcashNetwork,
  type ZcashRecipient,
} from './types.js';
import { parseOrchardRecipient } from './unified.js';

export * from './types.js';
/**
 * Rosen wire payload: the native two-byte version prefix and 20-byte hash160,
 * without Base58Check checksum, represented as exactly 44 lowercase hex digits.
 * Testnet and regtest share a prefix; callers must also bind node genesis.
 */
export function createZcashAddressCodec(network: ZcashNetwork) {
  if (network !== 'mainnet' && network !== 'testnet' && network !== 'regtest') {
    throw new UnsupportedZcashAddressError('network');
  }
  const expectedPrefix = network === 'mainnet' ? '1cb8' : '1d25';

  const checkPayload = (payloadHex: string): void => {
    if (typeof payloadHex !== 'string' || !/^[0-9a-f]{44}$/.test(payloadHex)) {
      throw new UnsupportedZcashAddressError('encoding');
    }
    const prefix = payloadHex.slice(0, 4);
    if (prefix !== '1cb8' && prefix !== '1d25') {
      throw new UnsupportedZcashAddressError('unsupported-kind');
    }
    if (prefix !== expectedPrefix) {
      throw new UnsupportedZcashAddressError('network');
    }
  };

  const parseAddress = (address: string): TransparentP2pkhRecipient => {
    if (typeof address !== 'string' || address.length > 4096) {
      throw new UnsupportedZcashAddressError('encoding');
    }
    // Format refusal only: no shielded/Unified decoding or receiver selection.
    if (
      /^(?:u1|utest1|uregtest1|zs1|ztestsapling1|zregtestsapling1|zc|zt|tex1|textest1|texregtest1)/.test(
        address,
      )
    ) {
      throw new UnsupportedZcashAddressError('unsupported-kind');
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]{35}$/.test(address)) {
      throw new UnsupportedZcashAddressError('encoding');
    }
    let payload: Uint8Array;
    try {
      payload = base58check.decode(address);
    } catch {
      throw new UnsupportedZcashAddressError('checksum');
    }
    const payloadHex = Buffer.from(payload).toString('hex');
    checkPayload(payloadHex);
    if (base58check.encode(payload) !== address) {
      throw new UnsupportedZcashAddressError('encoding');
    }
    return Object.freeze({
      kind: 'transparent-p2pkh' as const,
      network,
      address,
      payloadHex,
      scriptPubKeyHex: '76a914' + payloadHex.slice(4) + '88ac',
    });
  };

  const parseRecipient = (address: string): ZcashRecipient =>
    typeof address === 'string' && /^(?:u1|utest1|uregtest1)/.test(address)
      ? parseOrchardRecipient(address, network)
      : parseAddress(address);

  return Object.freeze({
    parseAddress,
    parseRecipient,
    encodeAddress: (address: string): string =>
      parseAddress(address).payloadHex,
    decodeAddress: (payloadHex: string): string => {
      checkPayload(payloadHex);
      return base58check.encode(Buffer.from(payloadHex, 'hex'));
    },
    validateTransparentAddress: (address: string): void => {
      parseAddress(address);
    },
    validateAddress: (address: string): void => {
      parseRecipient(address);
    },
  });
}
