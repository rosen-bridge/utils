import { resolvedCondition } from '../conditionsTestUtils';
import { comparisons } from './compareTestData';

describe('EqCondition', () => {
  describe('compare', () => {
    /**
     * @target EqCondition.compare should compare the port with 8080
     * @dependencies
     * - PathElement, StaticElement
     * @scenario
     * - evaluate `eq` of the port and 8080 for 80, 8080, 9000 and no port
     * @expected
     * - the results of `comparisons.eq`
     */
    it('should compare the port with 8080', () => {
      const condition = resolvedCondition({
        kind: 'eq',
        left: { path: 'port' },
        right: { value: 8080 },
      });
      expect(
        [{ port: 80 }, { port: 8080 }, { port: 9000 }, {}].map((config) =>
          condition.evaluate(config, []),
        ),
      ).toEqual(comparisons.eq);
    });
  });
});
