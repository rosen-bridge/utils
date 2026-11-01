import { resolvedCondition } from '../conditionsTestUtils';
import { comparisons } from './compareTestData';

describe('GtCondition', () => {
  describe('compare', () => {
    /**
     * @target GtCondition.compare should compare the port with 8080
     * @dependencies
     * - PathElement, StaticElement
     * @scenario
     * - evaluate `gt` of the port and 8080 for 80, 8080, 9000 and no port
     * @expected
     * - the results of `comparisons.gt`
     */
    it('should compare the port with 8080', () => {
      const condition = resolvedCondition({
        kind: 'gt',
        left: { path: 'port' },
        right: { value: 8080 },
      });
      expect(
        [{ port: 80 }, { port: 8080 }, { port: 9000 }, {}].map((config) =>
          condition.evaluate(config, []),
        ),
      ).toEqual(comparisons.gt);
    });
  });
});

describe('GtCondition strings and bigints', () => {
  /**
   * @target GtCondition.compare should order bigints and strings
   * @dependencies
   * - PathElement, StaticElement
   * @scenario
   * - evaluate `fee > 10` and `mode > "b"`
   * @expected
   * - bigints compared exactly, strings in code-unit order
   */
  it('should order bigints and strings', () => {
    const fee = resolvedCondition({
      kind: 'gt',
      left: { path: 'fee' },
      right: { value: '10000000000000000000' },
    });
    const mode = resolvedCondition({
      kind: 'gt',
      left: { path: 'mode' },
      right: { value: 'b' },
    });
    expect(fee.evaluate({ fee: 10000000000000000001n }, [])).toEqual(true);
    expect(mode.evaluate({ mode: 'c' }, [])).toEqual(true);
    expect(mode.evaluate({ mode: 'a' }, [])).toEqual(false);
  });
});
