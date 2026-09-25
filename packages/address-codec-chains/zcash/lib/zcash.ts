import base58check from 'bs58check';

export type ZcashNetwork = 'mainnet' | 'testnet' | 'regtest';
export type ZcashAddressFailure =
  | 'network'
  | 'unsupported-kind'
  | 'encoding'
  | 'checksum';
export class UnsupportedZcashAddressError extends Error {
  constructor(public readonly reason: ZcashAddressFailure) {
    super('Unsupported Zcash address: ' + reason);
    this.name = 'UnsupportedZcashAddressError';
  }
}
export interface TransparentP2pkhRecipient {
  readonly kind: 'transparent-p2pkh';
  readonly network: ZcashNetwork;
  readonly address: string;
  readonly payloadHex: string;
  readonly scriptPubKeyHex: string;
}
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

  return Object.freeze({
    parseAddress,
    encodeAddress: (address: string): string =>
      parseAddress(address).payloadHex,
    decodeAddress: (payloadHex: string): string => {
      checkPayload(payloadHex);
      return base58check.encode(Buffer.from(payloadHex, 'hex'));
    },
    validateAddress: (address: string): void => {
      parseAddress(address);
    },
  });
}
