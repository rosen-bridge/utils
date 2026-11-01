import { resolvedCondition } from '../conditionsTestUtils';

describe('AllCondition', () => {
  describe('evaluate', () => {
    /**
     * @target AllCondition.evaluate should combine the listed conditions
     * @dependencies
     * - ExistsCondition
     * @scenario
     * - evaluate `all` of "port exists" and "mode exists" with both, one
     *   and none set
     * @expected
     * - true only when both hold
     */
    it('should combine the listed conditions', () => {
      const condition = resolvedCondition({
        kind: 'all',
        conditions: [
          { kind: 'exists', operand: { path: 'port' } },
          { kind: 'exists', operand: { path: 'mode' } },
        ],
      });
      expect(
        [{ port: 1, mode: 'a' }, { port: 1 }, {}].map((config) =>
          condition.evaluate(config, []),
        ),
      ).toEqual([true, false, false]);
    });
  });
});
