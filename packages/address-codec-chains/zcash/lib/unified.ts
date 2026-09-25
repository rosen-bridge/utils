import { groupHash, jubjub } from '@noble/curves/jubjub';
import { pallas } from '@noble/curves/pasta';
import { blake2b } from '@noble/hashes/blake2b';
import { bech32m } from 'bech32';

import {
  UnsupportedZcashAddressError,
  type OrchardRecipient,
  type ZcashNetwork,
} from './types.js';

// The supported ZIP-316 revision-0 profile has at most one transparent (22),
// one Sapling (45), one Orchard (45) item, and 16 bytes of HRP padding.
// This is an admission bound, not a claim to support all future UA item types.
export const MAX_UNIFIED_ADDRESS_LENGTH = 256;
const MAX_JUMBLED_LENGTH = 128;
const hrps: Record<ZcashNetwork, string> = {
  mainnet: 'u',
  testnet: 'utest',
  regtest: 'uregtest',
};

function invalid(): never {
  throw new UnsupportedZcashAddressError('encoding');
}

/** ZIP-316 inverse F4Jumble. The caller bounds the message before allocating. */
function unjumble(encoded: Uint8Array): Uint8Array {
  const message = Uint8Array.from(encoded);
  const leftLength = Math.min(64, Math.floor(message.length / 2));
  const left = message.subarray(0, leftLength);
  const right = message.subarray(leftLength);
  const xor = (target: Uint8Array, mask: Uint8Array) => {
    for (let index = 0; index < Math.min(target.length, mask.length); index++) {
      target[index] ^= mask[index];
    }
  };
  const h = (round: number) => {
    const personalization = Buffer.concat([
      Buffer.from('UA_F4Jumble_H'),
      Buffer.from([round, 0, 0]),
    ]);
    xor(left, blake2b(right, { dkLen: left.length, personalization }));
  };
  const g = (round: number) => {
    for (let block = 0; block * 64 < right.length; block++) {
      const personalization = Buffer.concat([
        Buffer.from('UA_F4Jumble_G'),
        Buffer.from([round, block & 255, block >>> 8]),
      ]);
      xor(
        right.subarray(block * 64),
        blake2b(left, { dkLen: 64, personalization }),
      );
    }
  };
  h(1);
  g(1);
  h(0);
  g(0);
  return message;
}

/** Orchard raw pk_d uses little-endian x with y parity in its high bit. */
function checkOrchardReceiver(receiver: Uint8Array): void {
  const key = receiver.slice(11);
  if (key.every((byte) => byte === 0)) invalid(); // Native identity encoding.
  const sign = key[31] >>> 7;
  key[31] &= 0x7f;
  const compressed = Uint8Array.from([2 | sign, ...key.reverse()]);
  try {
    // Pallas has cofactor one; fromHex checks canonical x and curve membership,
    // and rejects the point at infinity. No private key operations occur here.
    pallas.ProjectivePoint.fromHex(compressed);
  } catch {
    invalid();
  }
}

/** Match sapling_crypto::PaymentAddress::from_bytes for every Sapling item. */
function checkSaplingReceiver(receiver: Uint8Array): void {
  try {
    // A valid diversifier hashes to a nonidentity prime-order Jubjub point.
    groupHash(receiver.subarray(0, 11), Buffer.from('Zcash_gd', 'ascii'));
    const key = receiver.subarray(11);
    const point = jubjub.ExtendedPoint.fromHex(key);
    if (
      !Buffer.from(point.toRawBytes()).equals(Buffer.from(key)) ||
      point.equals(jubjub.ExtendedPoint.ZERO) ||
      !point.isTorsionFree()
    )
      invalid();
  } catch {
    invalid();
  }
}

/** Canonical revision-0 UA with known receiver types and a usable Orchard receiver. */
export function parseOrchardRecipient(
  address: string,
  network: ZcashNetwork,
): OrchardRecipient {
  if (
    typeof address !== 'string' ||
    address.length > MAX_UNIFIED_ADDRESS_LENGTH ||
    !/^(?:u|utest|uregtest)1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/.test(address)
  )
    invalid();

  let decoded: ReturnType<typeof bech32m.decode>;
  try {
    decoded = bech32m.decode(address, MAX_UNIFIED_ADDRESS_LENGTH);
  } catch {
    throw new UnsupportedZcashAddressError('checksum');
  }
  if (decoded.prefix !== hrps[network])
    throw new UnsupportedZcashAddressError('network');
  let jumbled: Uint8Array;
  try {
    jumbled = Uint8Array.from(bech32m.fromWords(decoded.words));
  } catch {
    invalid();
  }
  // Orchard alone needs 45 + 16 = 61 bytes; 48 is the pinned F4Jumble minimum.
  if (jumbled.length < 48 || jumbled.length > MAX_JUMBLED_LENGTH) invalid();
  if (
    bech32m.encode(
      decoded.prefix,
      bech32m.toWords(jumbled),
      MAX_UNIFIED_ADDRESS_LENGTH,
    ) !== address
  )
    invalid();
  const raw = unjumble(jumbled);
  const padding = Buffer.alloc(16);
  padding.write(decoded.prefix, 'ascii');
  if (!Buffer.from(raw.subarray(-16)).equals(padding)) invalid();
  const items = raw.subarray(0, raw.length - 16);
  let previous = -1;
  let transparent = false;
  let receiverHex: string | undefined;
  for (let offset = 0; offset < items.length; ) {
    if (offset + 2 > items.length) invalid();
    const type = items[offset++];
    const length = items[offset++];
    // Every admitted type and length has a one-byte CompactSize encoding.
    // Larger/nonminimal encodings cannot describe this bounded profile.
    if (
      type >= 253 ||
      length >= 253 ||
      type <= previous ||
      offset + length > items.length
    )
      invalid();
    previous = type;
    if (type > 3) throw new UnsupportedZcashAddressError('unsupported-kind');
    if (length !== (type < 2 ? 20 : 43)) invalid();
    if (type < 2) {
      if (transparent) invalid();
      transparent = true;
    }
    if (type === 2)
      checkSaplingReceiver(items.subarray(offset, offset + length));
    if (type === 3) {
      const receiver = items.subarray(offset, offset + length);
      checkOrchardReceiver(receiver);
      receiverHex = Buffer.from(receiver).toString('hex');
    }
    offset += length;
  }
  if (receiverHex === undefined)
    throw new UnsupportedZcashAddressError('unsupported-kind');
  return Object.freeze({ kind: 'orchard', network, address, receiverHex });
}
