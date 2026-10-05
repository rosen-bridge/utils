import {
  BitcoinCashRosenExtractor,
  BitcoinCashRpcRosenExtractor,
} from '../../../lib/bitcoinCash';
import {
  address,
  deposit,
  tokenMap,
} from './bitcoinCashRosenExtractorTestUtils';

describe('BitcoinCashRosenExtractor', () => {
  describe('extractData', () => {
    /**
     * @target BitcoinCashRosenExtractor.extractData preserves the authenticated RPC extraction through JSON transport
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
     * @target BitcoinCashRosenExtractor.extractData retains the raw-byte versus projected-amount rejection
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
     * @target BitcoinCashRosenExtractor.extractData preserves the malformed-transport error boundary
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
     * @target BitcoinCashRosenExtractor.get wraps the native amount once at the universal consumer
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
     * @target BitcoinCashRosenExtractor.get honors the shared raw-data storage option
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
