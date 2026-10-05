import { describe, expect, it } from 'vitest';

import { BitcoinCashRosenExtractor } from '../../../lib/bitcoinCash';
import {
  canonicalLockRawData,
  canonicalLockRpc,
  canonicalLockWrappedData,
} from './canonicalLockTestData';
import {
  canonicalTokenMap,
  canonicalTreasuryAddress,
} from './canonicalLockTestUtils';

describe('BitcoinCashRosenExtractor', () => {
  describe('extractData', () => {
    /**
     * @target BitcoinCashRosenExtractor.extractData replays the canonical lock through JSON transport
     * @dependencies real RPC extractor, TokenMap and libauth; no network
     * @scenario configure the example map; serialize the retained signed RPC
     * projection as the chain transport; extract and compare all event fields
     * @expected raw amount, assets, source identity, destination and fees match
     */
    it('replays the canonical lock through JSON transport', async () => {
      const extractor = new BitcoinCashRosenExtractor(
        canonicalTreasuryAddress(),
        await canonicalTokenMap(),
      );
      expect(extractor.extractData(JSON.stringify(canonicalLockRpc))).toEqual(
        canonicalLockRawData,
      );
    });

    /**
     * @target BitcoinCashRosenExtractor.extractData rejects mismatched projected metadata
     * @dependencies real RPC extractor, TokenMap and libauth; no network
     * @scenario clone the projection; change only its metadata network-fee
     * byte; retain signed bytes, txid and all remaining fields; serialize
     * @expected extraction rejects the unauthenticated projected metadata
     */
    it('rejects mismatched projected metadata', async () => {
      const extractor = new BitcoinCashRosenExtractor(
        canonicalTreasuryAddress(),
        await canonicalTokenMap(),
      );
      const mutated = structuredClone(canonicalLockRpc);
      const bytes = Buffer.from(mutated.vout[1].scriptPubKey.hex, 'hex');
      bytes[18] = 101;
      mutated.vout[1].scriptPubKey.hex = bytes.toString('hex');
      expect(extractor.extractData(JSON.stringify(mutated))).toBeUndefined();
    });
  });

  describe('get', () => {
    /**
     * @target BitcoinCashRosenExtractor.get wraps the canonical JSON lock amount once
     * @dependencies real inherited extractor, TokenMap and address validation
     * @scenario configure the eight/six-decimal example map; run get on the
     * serialized canonical signed projection; compare every wrapped event field
     * @expected 100000 source satoshis become 1000 wrapped units, fees unchanged
     */
    it('wraps the canonical JSON lock amount once', async () => {
      const extractor = new BitcoinCashRosenExtractor(
        canonicalTreasuryAddress(),
        await canonicalTokenMap(),
      );
      expect(extractor.get(JSON.stringify(canonicalLockRpc))).toEqual(
        canonicalLockWrappedData,
      );
    });
  });
});
