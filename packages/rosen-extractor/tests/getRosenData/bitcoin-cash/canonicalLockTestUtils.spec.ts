import {
  createVirtualMachineBCH,
  encodeTransactionBCH,
  hashTransaction,
  hexToBin,
} from '@bitauth/libauth';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { canonicalLock } from './canonicalLockTestData';
import {
  decodeCanonicalTransaction,
  resolveCanonicalLock,
  verifyCanonicalLock,
} from './canonicalLockTestUtils';

describe('resolveCanonicalLock', () => {
  /**
   * @target resolveCanonicalLock authenticates the parent and preserves the unsigned body
   * @dependencies real libauth transaction codec; retained pre-signed fixture
   * @scenario resolve the signed outpoint; decode unsigned bytes; remove only
   * the signed unlocking script; compare bodies, identities, values and fee
   * @expected parent identity, body, 100000-satoshi lock and 576-satoshi fee match
   */
  it('authenticates the parent and preserves the unsigned body', () => {
    const resolved = resolveCanonicalLock();
    expect(
      [
        canonicalLock.parentTransactionHex,
        canonicalLock.unsignedHex,
        canonicalLock.signedHex,
      ].map((hex) => createHash('sha256').update(hexToBin(hex)).digest('hex')),
    ).toEqual([
      canonicalLock.parentSha256,
      canonicalLock.unsignedSha256,
      canonicalLock.signedSha256,
    ]);
    expect(hashTransaction(hexToBin(canonicalLock.signedHex))).toEqual(
      canonicalLock.txId,
    );
    expect(hexToBin(canonicalLock.signedHex).length).toEqual(
      canonicalLock.signedSizeBytes,
    );
    const unsigned = decodeCanonicalTransaction(canonicalLock.unsignedHex);
    const withoutSignature = structuredClone(resolved.transaction);
    withoutSignature.inputs[0].unlockingBytecode = new Uint8Array();
    expect(encodeTransactionBCH(withoutSignature)).toEqual(
      encodeTransactionBCH(unsigned),
    );
    expect(hashTransaction(hexToBin(canonicalLock.unsignedHex))).toEqual(
      canonicalLock.unsignedTxId,
    );
    expect(
      resolved.transaction.outputs.map((output) => output.valueSatoshis),
    ).toEqual([
      BigInt(canonicalLock.amountSatoshis),
      0n,
      BigInt(canonicalLock.changeSatoshis),
    ]);
    expect(
      resolved.sourceOutputs[0].valueSatoshis -
        resolved.transaction.outputs.reduce(
          (sum, output) => sum + output.valueSatoshis,
          0n,
        ),
    ).toEqual(BigInt(canonicalLock.minerFeeSatoshis));
  });
});

describe('verifyCanonicalLock', () => {
  /**
   * @target verifyCanonicalLock verifies the recorded signed lock offline
   * @dependencies real libauth BCH VM and authenticated parent output
   * @scenario resolve the parent; execute the signed P2PKH unlocking script
   * @expected BCH VM returns true without signing, broadcasting or node access
   */
  it('verifies the recorded signed lock offline', () => {
    expect(verifyCanonicalLock()).toEqual(true);
  });

  /**
   * @target verifyCanonicalLock rejects a changed treasury amount after signing
   * @dependencies real libauth BCH VM; all other fixture fields unchanged
   * @scenario decode signed bytes; increment only treasury value; re-encode;
   * verify with the unchanged authenticated parent
   * @expected the original signature rejects the altered output amount
   */
  it('rejects a changed treasury amount after signing', () => {
    const mutated = decodeCanonicalTransaction(canonicalLock.signedHex);
    mutated.outputs[0].valueSatoshis += 1n;
    expect(
      verifyCanonicalLock(
        Buffer.from(encodeTransactionBCH(mutated)).toString('hex'),
      ),
    ).toContain('signature');
  });

  /**
   * @target verifyCanonicalLock rejects changed metadata after signing
   * @dependencies real libauth BCH VM; all other fixture fields unchanged
   * @scenario decode signed bytes; change only the network-fee byte from 100
   * to 101 while retaining valid metadata structure; re-encode and verify
   * @expected the original signature rejects the altered metadata
   */
  it('rejects changed metadata after signing', () => {
    const mutated = decodeCanonicalTransaction(canonicalLock.signedHex);
    mutated.outputs[1].lockingBytecode[18] = 101;
    expect(
      verifyCanonicalLock(
        Buffer.from(encodeTransactionBCH(mutated)).toString('hex'),
      ),
    ).toContain('signature');
  });

  /**
   * @target verifyCanonicalLock rejects a changed signing prevout value
   * @dependencies real libauth BCH VM; authentic signed body and parent
   * @scenario resolve the authenticated parent; increment only the value
   * supplied to script verification; leave the signed transaction unchanged
   * @expected the signature rejects a digest formed from the wrong input value
   */
  it('rejects a changed signing prevout value', () => {
    const resolved = resolveCanonicalLock();
    resolved.sourceOutputs[0].valueSatoshis += 1n;
    expect(createVirtualMachineBCH().verify(resolved)).toContain('signature');
  });
});
