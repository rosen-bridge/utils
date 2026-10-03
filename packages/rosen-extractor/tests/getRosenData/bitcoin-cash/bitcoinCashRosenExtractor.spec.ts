import {
  CashAddressType,
  encodeCashAddress,
  encodeTransactionBCH,
  hashTransaction,
} from '@bitauth/libauth';

import { encodeBitcoinCashAddress } from '@rosen-bridge/address-codec-bitcoin-cash';
import { encodeErgoAddress } from '@rosen-bridge/address-codec-ergo';
import { TokenMap } from '@rosen-bridge/tokens';

import {
  BitcoinCashRosenExtractor,
  BitcoinCashRpcRosenExtractor,
  BitcoinCashRpcTransaction,
} from '../../../lib/bitcoinCash';

const address = encodeCashAddress({
  prefix: 'bitcoincash',
  type: CashAddressType.p2pkh,
  payload: new Uint8Array(20).fill(1),
}).address;
const script = encodeBitcoinCashAddress(address);

/** Builds a complete raw BCH deposit and its matching RPC projection. */
const deposit = (): BitcoinCashRpcTransaction => {
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
const tokenMap = async (): Promise<TokenMap> => {
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

describe('BitcoinCashRosenExtractor', () => {
  describe('extractData', () => {
    /**
     * @target BitcoinCashRosenExtractor.extractData
     * @dependencies real RPC extractor, TokenMap and libauth; no network
     * @scenario serialize a complete authenticated native BCH deposit
     * @expected the universal and RPC extractors return the same raw fields
     */
    it('preserves the authenticated RPC extraction through JSON transport', async () => {
      const tokens = await tokenMap();
      const transaction = deposit();
      const expected = new BitcoinCashRpcRosenExtractor(
        address,
        tokens,
      ).extractData(transaction);
      expect(expected?.amount).toEqual('123456789');
      expect(
        new BitcoinCashRosenExtractor(address, tokens).extractData(
          JSON.stringify(transaction),
        ),
      ).toEqual(expected);
    });

    /**
     * @target BitcoinCashRosenExtractor.extractData
     * @dependencies real RPC extractor and TokenMap; no network
     * @scenario change one projected satoshi while keeping raw bytes unchanged
     * @expected extraction refuses the inconsistent deposit
     */
    it('retains the raw-byte versus projected-amount rejection', async () => {
      const transaction = deposit();
      transaction.vout[0].value = '1.23456788';
      expect(
        new BitcoinCashRosenExtractor(address, await tokenMap()).extractData(
          JSON.stringify(transaction),
        ),
      ).toBeUndefined();
    });

    /**
     * @target BitcoinCashRosenExtractor.extractData
     * @dependencies JSON parser and real TokenMap; no network
     * @scenario pass malformed serialized JSON as the existing chain wrapper did
     * @expected a SyntaxError is raised before transaction interpretation
     */
    it('preserves the malformed-transport error boundary', async () => {
      const extractor = new BitcoinCashRosenExtractor(
        address,
        await tokenMap(),
      );
      expect(() => extractor.extractData('{')).toThrow(SyntaxError);
    });
  });

  describe('get', () => {
    /**
     * @target BitcoinCashRosenExtractor.get
     * @dependencies real native codec, RPC extractor and six-decimal TokenMap
     * @scenario get a serialized deposit with a two-decimal wrapping factor
     * @expected amount is divided by100 with ceiling once; normalized Rosen fees stay unchanged
     */
    it('wraps the native amount once at the universal consumer', async () => {
      const result = new BitcoinCashRosenExtractor(
        address,
        await tokenMap(),
      ).get(JSON.stringify(deposit()));
      expect(result?.amount).toEqual('1234568');
      expect(result?.bridgeFee).toEqual('291');
      expect(result?.networkFee).toEqual('1110');
    });

    /**
     * @target BitcoinCashRosenExtractor.get
     * @dependencies real RPC extractor and TokenMap; no network
     * @scenario disable raw-data storage on the universal consumer
     * @expected authenticated extraction succeeds with raw-data storage disabled
     */
    it('honors the shared raw-data storage option', async () => {
      const extractor = new BitcoinCashRosenExtractor(
        address,
        await tokenMap(),
        undefined,
        false,
      );
      expect(extractor.get(JSON.stringify(deposit()))?.rawData).toEqual(
        'raw-data extraction is off',
      );
    });
  });
});
