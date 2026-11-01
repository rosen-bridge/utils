import { resolvedCondition } from '../conditionsTestUtils';
import { comparisons } from './compareTestData';

describe('GteCondition', () => {
  describe('compare', () => {
    /**
     * @target GteCondition.compare should compare the port with 8080
     * @dependencies
     * - PathElement, StaticElement
     * @scenario
     * - evaluate `gte` of the port and 8080 for 80, 8080, 9000 and no port
     * @expected
     * - the results of `comparisons.gte`
     */
    it('should compare the port with 8080', () => {
      const condition = resolvedCondition({
        kind: 'gte',
        left: { path: 'port' },
        right: { value: 8080 },
      });
      expect(
        [{ port: 80 }, { port: 8080 }, { port: 9000 }, {}].map((config) =>
          condition.evaluate(config, []),
        ),
      ).toEqual(comparisons.gte);
    });
  });
});
