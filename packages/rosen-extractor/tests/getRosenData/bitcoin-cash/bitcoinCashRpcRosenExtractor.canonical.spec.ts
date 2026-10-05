import { describe, expect, it } from 'vitest';

import { BitcoinCashRpcRosenExtractor } from '../../../lib/bitcoinCash';
import {
  canonicalLockRawData,
  canonicalLockRpc,
  canonicalLockWrappedData,
} from './canonicalLockTestData';
import {
  canonicalTokenMap,
  canonicalTreasuryAddress,
} from './canonicalLockTestUtils';

describe('BitcoinCashRpcRosenExtractor', () => {
  describe('extractData', () => {
    /**
     * @target BitcoinCashRpcRosenExtractor.extractData replays the canonical signed lock fields
     * @dependencies real TokenMap, address codec and libauth; no RPC mocks
     * @scenario configure the example asset map; extract the retained signed
     * bytes through their matching RPC projection; compare every event field
     * @expected raw source amount, asset, outpoint, destination and fees match
     */
    it('replays the canonical signed lock fields', async () => {
      const extractor = new BitcoinCashRpcRosenExtractor(
        canonicalTreasuryAddress(),
        await canonicalTokenMap(),
      );
      expect(extractor.extractData(canonicalLockRpc)).toEqual(
        canonicalLockRawData,
      );
    });

    /**
     * @target BitcoinCashRpcRosenExtractor.extractData rejects a mismatched RPC amount
     * @dependencies real TokenMap, address codec and libauth; no network
     * @scenario clone the projection; increment only its treasury amount by
     * one satoshi; retain the signed bytes, txid and all remaining fields
     * @expected extraction rejects the single unauthenticated projected value
     */
    it('rejects a mismatched RPC amount', async () => {
      const extractor = new BitcoinCashRpcRosenExtractor(
        canonicalTreasuryAddress(),
        await canonicalTokenMap(),
      );
      const mutated = structuredClone(canonicalLockRpc);
      mutated.vout[0].value = '0.00100001';
      expect(extractor.extractData(mutated)).toBeUndefined();
    });
  });

  describe('get', () => {
    /**
     * @target BitcoinCashRpcRosenExtractor.get wraps the canonical lock amount once
     * @dependencies real inherited extractor, TokenMap and address validation
     * @scenario configure eight-decimal BCH and six-decimal wrapped asset;
     * run get on the retained signed RPC projection; compare all event fields
     * @expected 100000 source satoshis become 1000 wrapped units, fees unchanged
     */
    it('wraps the canonical lock amount once', async () => {
      const extractor = new BitcoinCashRpcRosenExtractor(
        canonicalTreasuryAddress(),
        await canonicalTokenMap(),
      );
      expect(extractor.get(canonicalLockRpc)).toEqual(canonicalLockWrappedData);
    });
  });
});
