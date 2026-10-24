import { resolvedCondition } from '../conditionsTestUtils';
import { comparisons } from './compareTestData';

describe('LteCondition', () => {
  describe('compare', () => {
    /**
     * @target LteCondition.compare should compare the port with 8080
     * @dependencies
     * - PathElement, StaticElement
     * @scenario
     * - evaluate `lte` of the port and 8080 for 80, 8080, 9000 and no port
     * @expected
     * - the results of `comparisons.lte`
     */
    it('should compare the port with 8080', () => {
      const condition = resolvedCondition({
        kind: 'lte',
        left: { path: 'port' },
        right: { value: 8080 },
      });
      expect(
        [{ port: 80 }, { port: 8080 }, { port: 9000 }, {}].map((config) =>
          condition.evaluate(config, []),
        ),
      ).toEqual(comparisons.lte);
    });
  });
});
