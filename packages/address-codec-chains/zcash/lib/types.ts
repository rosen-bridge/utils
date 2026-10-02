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

export interface OrchardRecipient {
  readonly kind: 'orchard';
  readonly network: ZcashNetwork;
  /** Exact canonical Unified Address from the event; never replaced with another UA. */
  readonly address: string;
  /** The selected 43-byte Orchard receiver, encoded as lowercase hex. */
  readonly receiverHex: string;
}

export type ZcashRecipient = TransparentP2pkhRecipient | OrchardRecipient;
