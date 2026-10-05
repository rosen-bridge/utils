import { describe, expect, it } from 'vitest';

import { importEntry } from './testUtils';

/** Source and package entry paths for the legacy public import surface. */
const entries = [
  {
    name: 'source',
    enabled: true,
    root: new URL('../lib/index.ts', import.meta.url).href,
    bitcoin: new URL(
      '../lib/getRosenData/bitcoin/bitcoinRpcRosenExtractor.ts',
      import.meta.url,
    ).href,
  },
  {
    name: 'built package',
    enabled: process.env.ROSEN_EXTRACTOR_BUILT_TESTS === '1',
    root: '@rosen-bridge/rosen-extractor',
    bitcoin:
      '@rosen-bridge/rosen-extractor/dist/getRosenData/bitcoin/bitcoinRpcRosenExtractor.js',
  },
];

describe('index', () => {
  describe.each(entries)('$name import boundary', (entry) => {
    /**
     * @target index loads the legacy root without BCH crypto
     * @dependencies fresh Node process, tsx and resolver rejecting
     * libauth crypto
     * @scenario import the root while transaction cryptography is
     * unavailable
     * @expected legacy chain exports load and BCH exports remain absent
     */
    it.skipIf(!entry.enabled)(
      'loads the legacy root without BCH crypto',
      () => {
        const result = importEntry(entry.root, true);
        expect(result.error).toBeUndefined();
        expect(result).toMatchObject({ status: 0 });
        const names = JSON.parse(result.stdout);
        expect(names).toEqual(
          expect.arrayContaining([
            'BitcoinRpcRosenExtractor',
            'CardanoKoiosRosenExtractor',
            'DogeRpcRosenExtractor',
            'ErgoNodeRosenExtractor',
            'EvmRpcRosenExtractor',
            'FiroRpcRosenExtractor',
            'HandshakeRpcRosenExtractor',
          ]),
        );
        expect(names).not.toContain('BitcoinCashRosenExtractor');
        expect(names).not.toContain('BitcoinCashRpcRosenExtractor');
      },
    );

    /**
     * @target index preserves the Bitcoin deep entry
     * @dependencies fresh Node process and resolver rejecting libauth
     * crypto
     * @scenario import the existing Bitcoin RPC extractor directly
     * @expected the unchanged deep entry resolves without BCH
     * cryptography
     */
    it.skipIf(!entry.enabled)('preserves the Bitcoin deep entry', () => {
      const result = importEntry(entry.bitcoin, true);
      expect(result.error).toBeUndefined();
      expect(result).toMatchObject({ status: 0 });
      expect(JSON.parse(result.stdout)).toContain('BitcoinRpcRosenExtractor');
    });
  });
});
