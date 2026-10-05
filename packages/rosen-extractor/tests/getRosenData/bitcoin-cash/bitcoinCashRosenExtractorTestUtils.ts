import {
  CashAddressType,
  encodeCashAddress,
  encodeTransactionBCH,
  hashTransaction,
} from '@bitauth/libauth';

import { encodeBitcoinCashAddress } from '@rosen-bridge/address-codec-bitcoin-cash';
import { encodeErgoAddress } from '@rosen-bridge/address-codec-ergo';
import { TokenMap } from '@rosen-bridge/tokens';

import { BitcoinCashRpcTransaction } from '../../../lib/bitcoinCash';

/** Native synthetic treasury address shared by the universal extraction cases. */
export const address = encodeCashAddress({
  prefix: 'bitcoincash',
  type: CashAddressType.p2pkh,
  payload: new Uint8Array(20).fill(1),
}).address;
/** Exact locking script for the synthetic treasury address. */
const script = encodeBitcoinCashAddress(address);

/** Builds a complete raw BCH deposit and its matching RPC projection. */
export const deposit = (): BitcoinCashRpcTransaction => {
  const sourceId = '11'.repeat(32);
  const receiver = encodeErgoAddress(
    '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  );
  const payload = `0000000000000001230000000000000456${(receiver.length / 2).toString(16).padStart(2, '0')}${receiver}`;
  const opReturn = `6a${(payload.length / 2).toString(16)}${payload}`;
  const bytes = encodeTransactionBCH({
    version: 2,
    locktime: 0,
    inputs: [
      {
        outpointTransactionHash: new Uint8Array(32).fill(0x11),
        outpointIndex: 7,
        sequenceNumber: 0xffffffff,
        unlockingBytecode: Uint8Array.of(0x51),
      },
    ],
    outputs: [
      {
        lockingBytecode: Uint8Array.from(Buffer.from(script, 'hex')),
        valueSatoshis: 123456789n,
      },
      {
        lockingBytecode: Uint8Array.from(Buffer.from(opReturn, 'hex')),
        valueSatoshis: 0n,
      },
    ],
  });
  return {
    hex: Buffer.from(bytes).toString('hex'),
    txid: hashTransaction(bytes),
    vin: [{ txid: sourceId, vout: 7 }],
    vout: [
      { n: 0, value: '1.23456789', scriptPubKey: { hex: script } },
      { n: 1, value: '0.00000000', scriptPubKey: { hex: opReturn } },
    ],
  };
};

/** Gives native BCH a six-decimal wrapped counterpart to detect double wrapping. */
export const tokenMap = async (): Promise<TokenMap> => {
  const map = new TokenMap();
  await map.updateConfigByJson([
    {
      'bitcoin-cash': {
        tokenId: 'bch',
        name: 'BCH',
        decimals: 8,
        type: 'native',
        residency: 'native',
        extra: {},
      },
      ergo: {
        tokenId: 'aa'.repeat(32),
        name: 'rsBCH',
        decimals: 6,
        type: 'EIP-004',
        residency: 'wrapped',
        extra: {},
      },
    },
  ]);
  return map;
};
