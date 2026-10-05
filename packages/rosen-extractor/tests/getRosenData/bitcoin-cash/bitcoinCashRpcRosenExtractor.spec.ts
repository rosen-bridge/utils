import {
  decodeTransactionBCH,
  encodeTransactionBCH,
  hashTransaction,
  Output,
} from '@bitauth/libauth';

import { TokenMap } from '@rosen-bridge/tokens';

import {
  BitcoinCashRpcRosenExtractor,
  BitcoinCashRpcTransaction,
} from '../../../lib/bitcoinCash';
import { MAX_BITCOIN_CASH_TRANSACTION_BYTES } from '../../../lib/getRosenData/bitcoin-cash/utils';
import { BITCOIN_CASH_CHAIN } from '../../../lib/getRosenData/const';
import {
  address,
  inputId,
  payload,
  native,
  event,
  raw,
  boundedDeposit,
  tokens,
} from './bitcoinCashRpcRosenExtractorTestUtils';
import { targetToken, destinationAddress } from './bitcoinCashTestData';
import { push } from './bitcoinCashTestUtils';

describe('BitcoinCashRpcRosenExtractor', () => {
  let extractor: BitcoinCashRpcRosenExtractor;
  beforeAll(async () => {
    extractor = new BitcoinCashRpcRosenExtractor(address, await tokens());
  });

  describe('constructor', () => {
    /**
     * @target BitcoinCashRpcRosenExtractor.constructor exports a distinct native BCH source identity
     * @dependencies
     * - The real extractor and TokenMap fixture
     * @scenario
     * - Construct the extractor with an ordinary native treasury
     * @expected
     * - BCH has its own source-chain identity
     */
    it('exports a distinct native BCH source identity', () => {
      expect(extractor.chain).toEqual(BITCOIN_CASH_CHAIN);
    });
    /**
     * @target BitcoinCashRpcRosenExtractor.constructor rejects legacy Bitcoin treasury address at construction
     * @dependencies real BCH codec and an empty TokenMap
     * @scenario construct with a legacy Bitcoin Base58 treasury
     * @expected construction rejects the incompatible treasury
     */
    it('rejects legacy Bitcoin treasury address at construction', () => {
      expect(
        () =>
          new BitcoinCashRpcRosenExtractor(
            '1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu',
            new TokenMap(),
          ),
      ).toThrow();
    });
  });

  describe('get', () => {
    /**
     * @target BitcoinCashRpcRosenExtractor.get isolates canonical deposit %s
     * @dependencies Real extractor, TokenMap and canonical libauth-encoded deposits with exact RPC projections
     * @scenario Vary only input count, output count or serialized byte length at its inclusive bound and one above
     * @expected Accept each exact bound and reject one above; raw identity, metadata, treasury and payload remain coherent
     */
    it.each([
      ['inputs at limit', 4096, 2, undefined, true],
      ['inputs above limit', 4097, 2, undefined, false],
      ['outputs at limit', 1, 4096, undefined, true],
      ['outputs above limit', 1, 4097, undefined, false],
      ['bytes at limit', 100, 2, 1_000_000, true],
      ['bytes above limit', 100, 2, 1_000_001, false],
    ] as const)(
      'isolates canonical deposit %s',
      (_name, inputs, outputs, bytes, accepted) => {
        const transaction = boundedDeposit(inputs, outputs, bytes);
        const encoded = Uint8Array.from(Buffer.from(transaction.hex, 'hex'));
        const decoded = decodeTransactionBCH(encoded);
        if (typeof decoded === 'string') throw Error(decoded);
        expect(decoded.inputs).toHaveLength(inputs);
        expect(decoded.outputs).toHaveLength(outputs);
        expect(transaction.vin).toHaveLength(inputs);
        expect(transaction.vout).toHaveLength(outputs);
        expect(
          Buffer.from(encodeTransactionBCH(decoded)).toString('hex'),
        ).toEqual(transaction.hex);
        expect(hashTransaction(encoded)).toEqual(transaction.txid);
        if (bytes !== undefined) expect(encoded.length).toEqual(bytes);
        else expect(encoded.length).toBeLessThan(1_000_000);
        const result = extractor.get(transaction);
        if (accepted)
          expect(result).toMatchObject({
            toChain: 'ergo',
            toAddress: destinationAddress,
            amount: '123456789',
            bridgeFee: '291',
            networkFee: '1110',
            sourceTxId: transaction.txid,
          });
        else expect(result).toBeUndefined();
      },
    );

    /**
     * @target BitcoinCashRpcRosenExtractor.get joins exact raw bytes, native treasury, Ergo destination and fee units through get()
     * @dependencies
     * - Libauth transaction bytes, canonical CashAddr and real TokenMap fixture
     * @scenario
     * - Extract a native treasury payment with one canonical Rosen payload
     * @expected
     * - Address, outpoint, token IDs, satoshis, fees and source txid match exactly
     */
    it('joins exact raw bytes, native treasury, Ergo destination and fee units through get()', () => {
      const tx = raw();
      expect(extractor.get(tx)).toEqual({
        toChain: 'ergo',
        toAddress: destinationAddress,
        bridgeFee: '291',
        networkFee: '1110',
        fromAddress: `box:${inputId.toString('hex')}.7`,
        sourceChainTokenId: 'bch',
        amount: '123456789',
        targetChainTokenId: targetToken,
        sourceTxId: tx.txid,
        rawData: push(payload),
      });
    });

    /**
     * @target BitcoinCashRpcRosenExtractor.get wraps amount with the real TokenMap while preserving fee source units
     * @dependencies
     * - Real TokenMap, Ergo codec, AddressManager and libauth transaction fixture
     * @scenario
     * - Encode an Ergo receiver and extract through an eight-to-six-decimal map
     * @expected
     * - The amount rounds to1234568; normalized Rosen fees remain291 and1110
     */
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
      expect(
        AddressManager.getInstance().decodeAddress('ergo', encoded),
      ).toEqual(ergoAddress);
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
      expect(wrapped?.amount).toEqual('1234568');
      expect(wrapped?.bridgeFee).toEqual('291');
      expect(wrapped?.networkFee).toEqual('1110');
    });

    /**
     * @target BitcoinCashRpcRosenExtractor.get honors raw-data suppression through inherited get()
     * @dependencies
     * - The real extractor, TokenMap and valid native transaction fixture
     * @scenario
     * - Construct with storeRawData disabled and extract a valid request
     * @expected
     * - The event contains the inherited raw-data suppression message
     */
    it('honors raw-data suppression through inherited get()', async () => {
      expect(
        new BitcoinCashRpcRosenExtractor(
          address,
          await tokens(),
          undefined,
          false,
        ).get(raw())?.rawData,
      ).toEqual('raw-data extraction is off');
    });

    /**
     * @target BitcoinCashRpcRosenExtractor.get fails closed for %s
     * @dependencies
     * - Real extractor and valid raw transaction mutated one field at a time
     * @scenario
     * - Change raw framing, txid, inputs, outputs, amounts or token metadata
     * - Attempt extraction for every isolated mutation in the table
     * @expected
     * - Each mutation returns no event
     */
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

    /**
     * @target BitcoinCashRpcRosenExtractor.get rejects %s
     * @dependencies
     * - Real extractor and independently encoded malformed transaction fixtures
     * @scenario
     * - Supply each absent, duplicate, token-bearing or noncanonical structure
     * @expected
     * - Each fixture returns no event
     */
    it.each([
      ['zero treasury amount', () => raw([native(0n), event()])],
      [
        'absent treasury output',
        () => raw([{ ...native(), lockingBytecode: Buffer.of(0x51) }, event()]),
      ],
      ['duplicate treasury outputs', () => raw([native(), native(), event()])],
      [
        'duplicate valid Rosen outputs',
        () => raw([native(), event(), event()]),
      ],
      [
        'missing Rosen output',
        () => raw([native(), { ...event(), lockingBytecode: Buffer.of(0x51) }]),
      ],
      [
        'raw coinbase outpoint',
        () => raw([native(), event()], Buffer.alloc(32)),
      ],
      [
        'CashToken treasury with omitted metadata',
        () =>
          raw([
            {
              ...native(),
              token: { amount: 1n, category: Buffer.alloc(32, 2) },
            },
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

    /**
     * @target BitcoinCashRpcRosenExtractor.get permits unrelated parsed CashTokens and checks any explicit token metadata
     * @dependencies
     * - Real extractor and a native request with one unrelated CashToken output
     * @scenario
     * - Extract with omitted metadata, matching metadata and mismatched amount
     * @expected
     * - Omitted and matching metadata pass; the inconsistent amount fails
     */
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

    /**
     * @target BitcoinCashRpcRosenExtractor.get rejects unrelated CashToken metadata mismatch in %s
     * @dependencies
     * - Real extractor and a valid CashToken fixture with an NFT
     * @scenario
     * - Confirm the valid event, then mutate category, NFT data or token presence
     * @expected
     * - The valid fixture passes and each isolated mutation returns no event
     */
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
    ])(
      'rejects unrelated CashToken metadata mismatch in %s',
      (_name, mutate) => {
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
      },
    );

    /**
     * @target BitcoinCashRpcRosenExtractor.get accepts empty unrelated scripts and explicit native token absence
     * @dependencies
     * - Real extractor and native request with an empty-script zero-value output
     * @scenario
     * - Set treasury token metadata to null and extract the request
     * @expected
     * - A valid event is returned
     */
    it('accepts empty unrelated scripts and explicit native token absence', () => {
      const tx = raw([
        native(),
        event(),
        { valueSatoshis: 0n, lockingBytecode: Buffer.alloc(0) },
      ]);
      tx.vout[0].tokenData = null;
      expect(extractor.get(tx)).toBeDefined();
    });

    /**
     * @target BitcoinCashRpcRosenExtractor.get preserves the largest uint64 fee without scaling or precision loss
     * @dependencies
     * - Real extractor and a Rosen payload with both fee fields set to all ones
     * @scenario
     * - Encode the payload into a native transaction and extract its fees
     * @expected
     * - Both fees equal the decimal string 18446744073709551615
     */
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
      expect(data?.bridgeFee).toEqual('18446744073709551615');
      expect(data?.networkFee).toEqual('18446744073709551615');
    });

    /**
     * @target BitcoinCashRpcRosenExtractor.get returns no event for unknown native token map
     * @dependencies
     * - Real extractor, empty TokenMap and valid native request fixture
     * @scenario
     * - Extract without registering the BCH native token
     * @expected
     * - No event is returned
     */
    it('returns no event for unknown native token map', () => {
      expect(
        new BitcoinCashRpcRosenExtractor(address, new TokenMap()).get(raw()),
      ).toBeUndefined();
    });
    /**
     * @target BitcoinCashRpcRosenExtractor.get returns no event for a missing target transformation
     * @dependencies
     * - Real extractor and a TokenMap containing an unrelated BCH asset only
     * @scenario
     * - Extract a native request through the incomplete map
     * @expected
     * - No event is returned
     */
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
  });

  describe('extractData', () => {
    /**
     * @target BitcoinCashRpcRosenExtractor.extractData keeps uint64 satoshi amounts exact without Number conversion
     * @dependencies
     * - Real raw extractor and authenticated libauth transaction bytes
     * @scenario
     * - Extract the maximum serialized uint64 treasury amount
     * @expected
     * - The extracted decimal amount is preserved without Number conversion
     */
    it('keeps uint64 satoshi amounts exact without Number conversion', () => {
      expect(
        extractor.extractData(raw([native(0xffffffffffffffffn), event()]))
          ?.amount,
      ).toEqual('18446744073709551615');
    });
  });
});
