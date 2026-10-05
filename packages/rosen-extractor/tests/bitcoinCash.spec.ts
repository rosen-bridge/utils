import { describe, expect, it } from 'vitest';

import { importEntry } from './testUtils';

/** Source and published package paths for explicit BCH consumers. */
const entries = [
  {
    name: 'source',
    enabled: true,
    bch: new URL('../lib/bitcoinCash.ts', import.meta.url).href,
  },
  {
    name: 'built package',
    enabled: process.env.ROSEN_EXTRACTOR_BUILT_TESTS === '1',
    bch: '@rosen-bridge/rosen-extractor/dist/bitcoinCash.js',
  },
];

describe('bitcoinCash', () => {
  describe.each(entries)('$name import boundary', (entry) => {
    /**
     * @target bitcoinCash loads the dedicated BCH entry
     * @dependencies fresh Node process and real libauth initialization
     * @scenario import the explicit BCH entry with its dependencies
     * available
     * @expected network and universal extractor classes are exported
     */
    it.skipIf(!entry.enabled)('loads the dedicated BCH entry', () => {
      const result = importEntry(entry.bch, false);
      expect(result.error).toBeUndefined();
      expect(result).toMatchObject({ status: 0 });
      expect(JSON.parse(result.stdout)).toEqual([
        'BitcoinCashRosenExtractor',
        'BitcoinCashRpcRosenExtractor',
      ]);
    });

    /**
     * @target bitcoinCash detects crypto on the BCH entry
     * @dependencies fresh Node process and resolver rejecting libauth
     * crypto
     * @scenario reject crypto while importing only the dedicated BCH
     * entry
     * @expected import fails at the sentinel, demonstrating a live
     * negative control
     */
    it.skipIf(!entry.enabled)('detects crypto on the BCH entry', () => {
      const result = importEntry(entry.bch, true);
      expect(result.error).toBeUndefined();
      expect(result.status).not.toEqual(0);
      expect(result.stderr).toContain('BCH_CRYPTO_IMPORT_SENTINEL');
    });
  });
});
