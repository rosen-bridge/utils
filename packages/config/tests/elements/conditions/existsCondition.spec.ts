import {
  errorPaths,
  parseCondition,
  resolvedCondition,
} from './conditionsTestUtils';

describe('ExistsCondition', () => {
  describe('parseNode', () => {
    /**
     * @target ExistsCondition.parseNode should require a path operand
     * @dependencies
     * @scenario
     * - parse `exists` without an operand, then with a value
     * @expected
     * - a problem at the condition, then at `operand`
     */
    it('should require a path operand', () => {
      expect(errorPaths(parseCondition({ kind: 'exists' }))).toEqual(['when']);
      expect(
        errorPaths(parseCondition({ kind: 'exists', operand: { value: 1 } })),
      ).toEqual(['when.operand']);
    });
  });

  describe('evaluate', () => {
    /**
     * @target ExistsCondition.evaluate should hold when the value is set
     * @dependencies
     * - PathElement
     * @scenario
     * - evaluate "tls exists" with and without tls
     * @expected
     * - true, then false
     */
    it('should hold when the value is set', () => {
      const condition = resolvedCondition({
        kind: 'exists',
        operand: { path: 'tls' },
      });
      expect(condition.evaluate({ tls: {} }, [])).toEqual(true);
      expect(condition.evaluate({}, [])).toEqual(false);
    });
  });
});
