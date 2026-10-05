import {
  createVirtualMachineBCH,
  decodeTransactionBCH,
  hashTransaction,
  hexToBin,
  lockingBytecodeToCashAddress,
  TransactionCommon,
} from '@bitauth/libauth';

import { TokenMap } from '@rosen-bridge/tokens';

import { canonicalLock } from './canonicalLockTestData';

/** Decode with copied bytes, rejecting malformed transaction encodings. */
export const decodeCanonicalTransaction = (hex: string): TransactionCommon => {
  const decoded = decodeTransactionBCH(hexToBin(hex));
  if (typeof decoded === 'string') throw new Error(decoded);
  return decoded;
};

/** Authenticate the parent body, outpoint, amount and locking script offline. */
export const resolveCanonicalLock = (signedHex = canonicalLock.signedHex) => {
  const transaction = decodeCanonicalTransaction(signedHex);
  const parentBytes = hexToBin(canonicalLock.parentTransactionHex);
  const parent = decodeCanonicalTransaction(canonicalLock.parentTransactionHex);
  const output = parent.outputs[canonicalLock.parentIndex];
  if (
    hashTransaction(parentBytes) !== canonicalLock.parentTxId ||
    transaction.inputs.length !== 1 ||
    Buffer.from(transaction.inputs[0].outpointTransactionHash).toString(
      'hex',
    ) !== canonicalLock.parentTxId ||
    transaction.inputs[0].outpointIndex !== canonicalLock.parentIndex ||
    output.valueSatoshis !== BigInt(canonicalLock.parentValueSatoshis) ||
    Buffer.from(output.lockingBytecode).toString('hex') !==
      canonicalLock.sourceScript ||
    output.token !== undefined
  )
    throw new Error('Canonical lock parent or outpoint mismatch');
  return { transaction, sourceOutputs: [output] };
};

/** Verify retained P2PKH/Schnorr ForkID scripts; no signing or node access. */
export const verifyCanonicalLock = (signedHex = canonicalLock.signedHex) =>
  createVirtualMachineBCH().verify(resolveCanonicalLock(signedHex));

/** Encode the recorded treasury script for the public extractor constructor. */
export const canonicalTreasuryAddress = (): string => {
  const result = lockingBytecodeToCashAddress({
    bytecode: hexToBin(canonicalLock.treasuryScript),
    prefix: 'bitcoincash',
  });
  if (typeof result === 'string') throw new Error(result);
  return result.address;
};

/** Configure the example's synthetic six-decimal Ergo representation. */
export const canonicalTokenMap = async (): Promise<TokenMap> => {
  const tokens = new TokenMap();
  await tokens.updateConfigByJson([
    {
      'bitcoin-cash': {
        tokenId: 'bch',
        name: 'BCH',
        decimals: canonicalLock.sourceDecimals,
        type: 'native',
        residency: 'native',
        extra: {},
      },
      ergo: {
        tokenId: canonicalLock.targetTokenId,
        name: 'rsBCH',
        decimals: canonicalLock.wrappedDecimals,
        type: 'EIP-004',
        residency: 'wrapped',
        extra: {},
      },
    },
  ]);
  return tokens;
};
