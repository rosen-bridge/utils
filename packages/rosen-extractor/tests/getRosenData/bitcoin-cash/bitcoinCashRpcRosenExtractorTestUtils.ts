import {
  CashAddressType,
  encodeCashAddress,
  encodeTransactionBCH,
  hashTransaction,
  Output,
  TransactionCommon,
} from '@bitauth/libauth';

import { encodeBitcoinCashAddress } from '@rosen-bridge/address-codec-bitcoin-cash';
import { encodeErgoAddress } from '@rosen-bridge/address-codec-ergo';
import { TokenMap } from '@rosen-bridge/tokens';

import { BitcoinCashRpcTransaction } from '../../../lib/bitcoinCash';
import { destinationAddress, targetToken } from './bitcoinCashTestData';
import { push } from './bitcoinCashTestUtils';

/** Deterministic native synthetic treasury address. */
export const address = encodeCashAddress({
  prefix: 'bitcoincash',
  type: CashAddressType.p2pkh,
  payload: Buffer.alloc(20, 1),
}).address;
/** Exact locking script derived from the treasury address. */
const script = encodeBitcoinCashAddress(address);
/** Deterministic synthetic source-input identifier. */
export const inputId = Buffer.from(
  Array.from({ length: 32 }, (_, index) => index + 1),
);
/** Canonical script representation of the public Ergo receiver. */
const destinationScript = encodeErgoAddress(destinationAddress);
/** Exact Rosen payload for the synthetic receiver and fee fields. */
export const payload = Buffer.from(
  `0000000000000001230000000000000456${(destinationScript.length / 2).toString(16).padStart(2, '0')}${destinationScript}`,
  'hex',
);
/** Construct a native treasury output without token metadata. */
export const native = (satoshis = 123456789n): Output => ({
  lockingBytecode: Buffer.from(script, 'hex'),
  valueSatoshis: satoshis,
});
/** Construct the assigned Ergo destination payload output. */
export const event = (): Output => ({
  lockingBytecode: Buffer.from(push(payload), 'hex'),
  valueSatoshis: 0n,
});
/** Project integer satoshis to exact RPC BCH decimal text. */
const decimal = (value: bigint): string =>
  `${value / 100000000n}.${(value % 100000000n).toString().padStart(8, '0')}`;
/** Encode raw bytes and their matching RPC transaction projection. */
export const raw = (
  outputs: Output[] = [native(), event()],
  inputHash = inputId,
): BitcoinCashRpcTransaction => {
  const tx: TransactionCommon = {
    version: 2,
    locktime: 0,
    inputs: [
      {
        outpointTransactionHash: Uint8Array.from(inputHash),
        outpointIndex: 7,
        sequenceNumber: 0xffffffff,
        unlockingBytecode: Uint8Array.of(0x51),
      },
    ],
    outputs: outputs.map((output) => ({
      ...output,
      lockingBytecode: Uint8Array.from(output.lockingBytecode),
      token: output.token && {
        ...output.token,
        category: Uint8Array.from(output.token.category),
        nft: output.token.nft && {
          ...output.token.nft,
          commitment: Uint8Array.from(output.token.nft.commitment),
        },
      },
    })),
  };
  const bytes = encodeTransactionBCH(tx);
  return {
    hex: Buffer.from(bytes).toString('hex'),
    txid: hashTransaction(bytes),
    vin: [{ txid: Buffer.from(inputHash).toString('hex'), vout: 7 }],
    vout: outputs.map((output, n) => ({
      n,
      value: decimal(output.valueSatoshis),
      scriptPubKey: {
        hex: Buffer.from(output.lockingBytecode).toString('hex'),
      },
    })),
  };
};
/** Encode a consistent deposit at one admission boundary, without claiming script validity. */
export const boundedDeposit = (
  inputCount: number,
  outputCount: number,
  byteLength?: number,
): BitcoinCashRpcTransaction => {
  const otherScript = Buffer.from(`76a914${'02'.repeat(20)}88ac`, 'hex');
  const outputs = [
    native(),
    event(),
    ...Array.from({ length: outputCount - 2 }, () => ({
      lockingBytecode: otherScript,
      valueSatoshis: 546n,
    })),
  ];
  const inputs = Array.from({ length: inputCount }, (_, index) => ({
    outpointTransactionHash: Uint8Array.from(inputId),
    outpointIndex: index + 7,
    sequenceNumber: 0xffffffff,
    unlockingBytecode: new Uint8Array(byteLength === undefined ? 1 : 256),
  }));
  const transaction = { version: 2, locktime: 0, inputs, outputs };
  if (byteLength !== undefined) {
    const padding = byteLength - encodeTransactionBCH(transaction).length;
    if (padding < 0) throw Error('Fixture byte target is too small');
    inputs.forEach((input, index) => {
      input.unlockingBytecode = new Uint8Array(
        256 +
          Math.floor(padding / inputCount) +
          (index < padding % inputCount ? 1 : 0),
      );
      if (input.unlockingBytecode.length > 10_000)
        throw Error('Fixture input script exceeds its isolated script bound');
    });
  }
  const bytes = encodeTransactionBCH(transaction);
  return {
    hex: Buffer.from(bytes).toString('hex'),
    txid: hashTransaction(bytes),
    vin: inputs.map((input) => ({
      txid: Buffer.from(input.outpointTransactionHash).toString('hex'),
      vout: input.outpointIndex,
    })),
    vout: outputs.map((output, n) => ({
      n,
      value: decimal(output.valueSatoshis),
      scriptPubKey: {
        hex: Buffer.from(output.lockingBytecode).toString('hex'),
      },
    })),
  };
};
/** Map the native BCH asset to its Ergo representation at selected decimals. */
export const tokens = async (
  sourceDecimals = 8,
  targetDecimals = 8,
): Promise<TokenMap> => {
  const map = new TokenMap();
  await map.updateConfigByJson([
    {
      'bitcoin-cash': {
        tokenId: 'bch',
        name: 'BCH',
        decimals: sourceDecimals,
        type: 'native',
        residency: 'native',
        extra: {},
      },
      ergo: {
        tokenId: targetToken,
        name: 'rsBCH',
        decimals: targetDecimals,
        type: 'EIP-004',
        residency: 'wrapped',
        extra: {},
      },
    },
  ]);
  return map;
};
