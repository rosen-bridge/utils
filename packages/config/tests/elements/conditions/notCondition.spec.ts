import {
  errorPaths,
  parseCondition,
  resolvedCondition,
} from './conditionsTestUtils';

describe('NotCondition', () => {
  describe('parseNode', () => {
    /**
     * @target NotCondition.parseNode should require a condition
     * @dependencies
     * @scenario
     * - parse `not` without a condition, then with an invalid one
     * @expected
     * - a problem at the condition, then at `condition`
     */
    it('should require a condition', () => {
      expect(errorPaths(parseCondition({ kind: 'not' }))).toEqual(['when']);
      expect(
        errorPaths(parseCondition({ kind: 'not', condition: 'x' })),
      ).toEqual(['when.condition']);
    });
  });

  describe('evaluate', () => {
    /**
     * @target NotCondition.evaluate should negate the condition
     * @dependencies
     * - ExistsCondition
     * @scenario
     * - evaluate "not port exists" with and without a port
     * @expected
     * - false, then true
     */
    it('should negate the condition', () => {
      const condition = resolvedCondition({
        kind: 'not',
        condition: { kind: 'exists', operand: { path: 'port' } },
      });
      expect(condition.evaluate({ port: 1 }, [])).toEqual(false);
      expect(condition.evaluate({}, [])).toEqual(true);
    });
  });
});
