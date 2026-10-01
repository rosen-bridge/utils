import {
  CashAddressType,
  encodeCashAddress,
  encodeTransactionBCH,
  hashTransaction,
  Output,
  TransactionCommon,
} from '@bitauth/libauth';

import { encodeBitcoinCashAddress } from '@rosen-bridge/address-codec-bitcoin-cash';
import { TokenMap } from '@rosen-bridge/tokens';

import {
  BitcoinCashRpcRosenExtractor,
  BitcoinCashRpcTransaction,
} from '../../../lib';
import {
  bitcoinCashValueToSatoshis,
  decodeBitcoinCashOpReturnPayload,
  MAX_BITCOIN_CASH_TRANSACTION_BYTES,
  parseBitcoinCashOpReturn,
} from '../../../lib/getRosenData/bitcoin-cash/utils';
import {
  BITCOIN_CASH_CHAIN,
  SUPPORTED_CHAINS,
} from '../../../lib/getRosenData/const';

const address = encodeCashAddress({
  prefix: 'bitcoincash',
  type: CashAddressType.p2pkh,
  payload: Buffer.alloc(20, 1),
}).address;
const script = encodeBitcoinCashAddress(address);
const inputId = Buffer.from(
  Array.from({ length: 32 }, (_, index) => index + 1),
);
const targetToken = 'aa'.repeat(32);
const payload = Buffer.from(
  `0a0000000000000123000000000000045619${script}`,
  'hex',
);
const push = (data: Buffer): string =>
  `6a${data.length <= 75 ? data.length.toString(16).padStart(2, '0') : `4c${data.length.toString(16)}`}${data.toString('hex')}`;
const native = (satoshis = 123456789n): Output => ({
  lockingBytecode: Buffer.from(script, 'hex'),
  valueSatoshis: satoshis,
});
const event = (): Output => ({
  lockingBytecode: Buffer.from(push(payload), 'hex'),
  valueSatoshis: 0n,
});
const decimal = (value: bigint): string =>
  `${value / 100000000n}.${(value % 100000000n).toString().padStart(8, '0')}`;
const raw = (
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
const tokens = async (
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

describe('native Bitcoin Cash RPC extraction', () => {
  let extractor: BitcoinCashRpcRosenExtractor;
  beforeAll(async () => {
    extractor = new BitcoinCashRpcRosenExtractor(address, await tokens());
  });

  it('exports BCH identity and leaves prior chain indexes unchanged', () => {
    expect(extractor.chain).toBe(BITCOIN_CASH_CHAIN);
    expect(SUPPORTED_CHAINS.map(({ index }) => index)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it('joins exact raw bytes, target CashAddr, source outpoint, native token mapping and fee units through get()', () => {
    const tx = raw();
    expect(extractor.get(tx)).toEqual({
      toChain: 'bitcoin-cash',
      toAddress: address,
      bridgeFee: '291',
      networkFee: '1110',
      fromAddress: `box:${inputId.toString('hex')}.7`,
      sourceChainTokenId: 'bch',
      amount: '123456789',
      targetChainTokenId: 'bch',
      sourceTxId: tx.txid,
      rawData: push(payload),
    });
  });

  it('wraps amount with the real TokenMap while preserving fee source units', async () => {
    const toErgoPayload = Buffer.from(
      '000000000000000123000000000000045620' + targetToken,
      'hex',
    );
    // Ergo decoder accepts the script representation supplied by its encoder.
    const { encodeErgoAddress } = await import(
      '@rosen-bridge/address-codec-ergo'
    );
    const { AddressManager } = await import('@rosen-bridge/address-manager');
    const ergoAddress = '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd';
    const encoded = encodeErgoAddress(ergoAddress);
    const receiver = Buffer.from(encoded, 'hex');
    const header = toErgoPayload.subarray(0, 17);
    const ergoPayload = Buffer.concat([
      header,
      Buffer.of(receiver.length),
      receiver,
    ]);
    expect(AddressManager.getInstance().decodeAddress('ergo', encoded)).toBe(
      ergoAddress,
    );
    const tx = raw([
      native(),
      {
        lockingBytecode: Buffer.from(push(ergoPayload), 'hex'),
        valueSatoshis: 0n,
      },
    ]);
    const wrapped = new BitcoinCashRpcRosenExtractor(
      address,
      await tokens(8, 6),
    ).get(tx);
    expect(wrapped?.amount).toBe('1234568');
    expect(wrapped?.bridgeFee).toBe('291');
    expect(wrapped?.networkFee).toBe('1110');
  });

  it('honors raw-data suppression through inherited get()', async () => {
    expect(
      new BitcoinCashRpcRosenExtractor(
        address,
        await tokens(),
        undefined,
        false,
      ).get(raw())?.rawData,
    ).toBe('raw-data extraction is off');
  });

  it.each([
    [
      'txid mismatch',
      (tx: BitcoinCashRpcTransaction) => {
        tx.txid = 'ff'.repeat(32);
      },
    ],
    [
      'missing raw bytes',
      (tx: BitcoinCashRpcTransaction) => {
        tx.hex = '';
      },
    ],
    [
      'malformed raw hex',
      (tx: BitcoinCashRpcTransaction) => {
        tx.hex = 'zz';
      },
    ],
    [
      'odd raw hex',
      (tx: BitcoinCashRpcTransaction) => {
        tx.hex += '0';
      },
    ],
    [
      'truncated raw transaction',
      (tx: BitcoinCashRpcTransaction) => {
        tx.hex = tx.hex.slice(0, -2);
      },
    ],
    [
      'trailing raw data',
      (tx: BitcoinCashRpcTransaction) => {
        tx.hex += '00';
        tx.txid = hashTransaction(Buffer.from(tx.hex, 'hex'));
      },
    ],
    [
      'oversized raw transaction',
      (tx: BitcoinCashRpcTransaction) => {
        tx.hex = '00'.repeat(MAX_BITCOIN_CASH_TRANSACTION_BYTES + 1);
      },
    ],
    [
      'RPC output count mismatch',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout.pop();
      },
    ],
    [
      'RPC output index mismatch',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[0].n = 1;
      },
    ],
    [
      'RPC script mismatch',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[0].scriptPubKey.hex = '51';
      },
    ],
    [
      'RPC value mismatch',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[0].value = '1.23456790';
      },
    ],
    [
      'fractional satoshi metadata',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[0].value = '1.234567891';
      },
    ],
    [
      'non-finite amount',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[0].value = NaN;
      },
    ],
    [
      'invented token metadata',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[0].tokenData = { category: 'ff'.repeat(32), amount: '1' };
      },
    ],
    [
      'missing first-input reference',
      (tx: BitcoinCashRpcTransaction) => {
        delete tx.vin[0].txid;
      },
    ],
    [
      'wrong source input index',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vin[0].vout = 8;
      },
    ],
    [
      'wrong source input byte order',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vin[0].txid = Buffer.from(inputId).reverse().toString('hex');
      },
    ],
    [
      'coinbase metadata',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vin[0].coinbase = '51';
      },
    ],
    [
      'input count mismatch',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vin.push({ txid: 'ff'.repeat(32), vout: 1 });
      },
    ],
    [
      'input collection bound',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vin = Array(4097).fill(tx.vin[0]);
      },
    ],
    [
      'output collection bound',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout = Array(4097).fill(tx.vout[0]);
      },
    ],
  ])('fails closed for %s', (_name, mutate) => {
    const tx = raw();
    mutate(tx);
    expect(extractor.get(tx)).toBeUndefined();
  });

  it.each([
    ['zero treasury amount', () => raw([native(0n), event()])],
    [
      'absent treasury output',
      () => raw([{ ...native(), lockingBytecode: Buffer.of(0x51) }, event()]),
    ],
    ['duplicate treasury outputs', () => raw([native(), native(), event()])],
    ['duplicate valid Rosen outputs', () => raw([native(), event(), event()])],
    [
      'missing Rosen output',
      () => raw([native(), { ...event(), lockingBytecode: Buffer.of(0x51) }]),
    ],
    ['raw coinbase outpoint', () => raw([native(), event()], Buffer.alloc(32))],
    [
      'CashToken treasury with omitted metadata',
      () =>
        raw([
          { ...native(), token: { amount: 1n, category: Buffer.alloc(32, 2) } },
          event(),
        ]),
    ],
    [
      'invalid target chain',
      () =>
        raw([
          native(),
          {
            ...event(),
            lockingBytecode: Buffer.from(
              push(Buffer.concat([Buffer.of(0xff), payload.subarray(1)])),
              'hex',
            ),
          },
        ]),
    ],
    [
      'invalid target address script',
      () =>
        raw([
          native(),
          {
            ...event(),
            lockingBytecode: Buffer.from(
              push(
                Buffer.concat([payload.subarray(0, 17), Buffer.of(1, 0x51)]),
              ),
              'hex',
            ),
          },
        ]),
    ],
    [
      'Rosen payload trailing data',
      () =>
        raw([
          native(),
          {
            ...event(),
            lockingBytecode: Buffer.from(
              push(Buffer.concat([payload, Buffer.of(0)])),
              'hex',
            ),
          },
        ]),
    ],
    [
      'noncanonical PUSHDATA1',
      () =>
        raw([
          native(),
          {
            ...event(),
            lockingBytecode: Buffer.from(
              `6a4c${payload.length.toString(16)}${payload.toString('hex')}`,
              'hex',
            ),
          },
        ]),
    ],
  ])('rejects %s', (_name, create) => {
    expect(extractor.get(create())).toBeUndefined();
  });

  it('permits unrelated parsed CashTokens and checks any explicit token metadata', () => {
    const output = {
      ...native(),
      lockingBytecode: Buffer.of(0x51),
      token: { amount: 5n, category: Buffer.alloc(32, 2) },
    };
    const tx = raw([native(), event(), output]);
    expect(extractor.get(tx)).toBeDefined();
    tx.vout[2].tokenData = { category: '02'.repeat(32), amount: '5' };
    expect(extractor.get(tx)).toBeDefined();
    tx.vout[2].tokenData.amount = '6';
    expect(extractor.get(tx)).toBeUndefined();
  });

  it.each([
    [
      'category',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[2].tokenData!.category = '03'.repeat(32);
      },
    ],
    [
      'NFT capability',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[2].tokenData!.nft!.capability = 'minting';
      },
    ],
    [
      'NFT commitment',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[2].tokenData!.nft!.commitment = '03';
      },
    ],
    [
      'missing NFT',
      (tx: BitcoinCashRpcTransaction) => {
        delete tx.vout[2].tokenData!.nft;
      },
    ],
    [
      'explicit absence',
      (tx: BitcoinCashRpcTransaction) => {
        tx.vout[2].tokenData = null;
      },
    ],
  ])('rejects unrelated CashToken metadata mismatch in %s', (_name, mutate) => {
    const output: Output = {
      ...native(),
      lockingBytecode: Buffer.of(0x51),
      token: {
        amount: 5n,
        category: Buffer.alloc(32, 2),
        nft: { capability: 'mutable', commitment: Buffer.of(1) },
      },
    };
    const tx = raw([native(), event(), output]);
    tx.vout[2].tokenData = {
      category: '02'.repeat(32),
      amount: '5',
      nft: { capability: 'mutable', commitment: '01' },
    };
    expect(extractor.get(tx)).toBeDefined();
    mutate(tx);
    expect(extractor.get(tx)).toBeUndefined();
  });

  it('accepts empty unrelated scripts and explicit native token absence', () => {
    const tx = raw([
      native(),
      event(),
      { valueSatoshis: 0n, lockingBytecode: Buffer.alloc(0) },
    ]);
    tx.vout[0].tokenData = null;
    expect(extractor.get(tx)).toBeDefined();
  });

  it('preserves the largest uint64 fee without scaling or precision loss', () => {
    const fees = Buffer.concat([
      payload.subarray(0, 1),
      Buffer.alloc(16, 0xff),
      payload.subarray(17),
    ]);
    const data = extractor.get(
      raw([
        native(),
        { ...event(), lockingBytecode: Buffer.from(push(fees), 'hex') },
      ]),
    );
    expect(data?.bridgeFee).toBe('18446744073709551615');
    expect(data?.networkFee).toBe('18446744073709551615');
  });

  it('returns no event for unknown native token map', () => {
    expect(
      new BitcoinCashRpcRosenExtractor(address, new TokenMap()).get(raw()),
    ).toBeUndefined();
  });
  it('returns no event for a missing target transformation', async () => {
    const map = new TokenMap();
    await map.updateConfigByJson([
      {
        'bitcoin-cash': {
          tokenId: 'other',
          name: 'other',
          decimals: 8,
          type: 'native',
          residency: 'native',
          extra: {},
        },
      },
    ]);
    expect(
      new BitcoinCashRpcRosenExtractor(address, map).get(raw()),
    ).toBeUndefined();
  });
  it('rejects legacy Bitcoin treasury address at construction', () => {
    expect(
      () =>
        new BitcoinCashRpcRosenExtractor(
          '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu',
          new TokenMap(),
        ),
    ).toThrow();
  });
  it('keeps uint64 satoshi amounts exact without Number conversion', () => {
    expect(
      extractor.extractData(raw([native(0xffffffffffffffffn), event()]))
        ?.amount,
    ).toBe('18446744073709551615');
    expect(bitcoinCashValueToSatoshis(1e-8)).toBe(1n);
    expect(() => bitcoinCashValueToSatoshis('184467440737.09551616')).toThrow();
  });
});

describe('bounded canonical BCH OP_RETURN framing', () => {
  it.each([75, 76, 80])(
    'accepts canonical framing of %i bytes up to receiver decoding',
    (length) => {
      const data = Buffer.concat([
        payload.subarray(0, 17),
        Buffer.of(length - 18),
        Buffer.alloc(length - 18, 0x51),
      ]);
      expect(decodeBitcoinCashOpReturnPayload(push(data))).toEqual(data);
      expect(() => parseBitcoinCashOpReturn(push(data))).toThrow(
        /noncanonical|unsupported/i,
      );
    },
  );
  it('rejects direct-push opcode 76 and nonminimal PUSHDATA1 at 75', () => {
    expect(() =>
      decodeBitcoinCashOpReturnPayload('6a4c' + '51'.repeat(76)),
    ).toThrow();
    expect(() =>
      decodeBitcoinCashOpReturnPayload('6a4c4b' + '51'.repeat(75)),
    ).toThrow();
  });
  it.each([
    '6a',
    '6a01',
    '6a010051',
    '6a4d010051',
    '6a4c0151',
    '6a4c50',
    '6azz',
    push(Buffer.alloc(81)),
    '6a' + '00'.repeat(84),
  ])('rejects malformed, truncated, multiple or oversized push %s', (hex) => {
    expect(() => parseBitcoinCashOpReturn(hex)).toThrow();
  });
});
