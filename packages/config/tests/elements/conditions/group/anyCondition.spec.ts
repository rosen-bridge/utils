import { resolvedCondition } from '../conditionsTestUtils';

describe('AnyCondition', () => {
  describe('evaluate', () => {
    /**
     * @target AnyCondition.evaluate should combine the listed conditions
     * @dependencies
     * - ExistsCondition
     * @scenario
     * - evaluate `any` of "port exists" and "mode exists" with both, one
     *   and none set
     * @expected
     * - true when one holds
     */
    it('should combine the listed conditions', () => {
      const condition = resolvedCondition({
        kind: 'any',
        conditions: [
          { kind: 'exists', operand: { path: 'port' } },
          { kind: 'exists', operand: { path: 'mode' } },
        ],
      });
      expect(
        [{ port: 1, mode: 'a' }, { port: 1 }, {}].map((config) =>
          condition.evaluate(config, []),
        ),
      ).toEqual([true, true, false]);
    });
  });
});
