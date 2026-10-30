import { errorPaths, parseRule, rule } from '../rulesTestUtils';

describe('BoundRule', () => {
  describe('parseExtra', () => {
    /**
     * @target BoundRule.parseExtra should read the bound as a value of the
     * target type
     * @dependencies
     * - MinRule, BigintElement
     * @scenario
     * - parse a bigint `min` with a bound beyond the safe range
     * @expected
     * - a value one below the bound fails
     */
    it('should read the bound as a value of the target type', () => {
      const min = rule(
        { kind: 'min', bound: '10000000000000000001' },
        'bigint',
      );
      expect(min.validate(10000000000000000000n)).toEqual(
        'must be at least 10000000000000000001',
      );
    });

    /**
     * @target BoundRule.parseExtra should require a valid bound
     * @dependencies
     * - MinRule
     * @scenario
     * - parse `min` without a bound, then with `"x"`
     * @expected
     * - a problem at the rule, then at `bound`
     */
    it('should require a valid bound', () => {
      expect(errorPaths(parseRule({ kind: 'min' }, 'number'))).toEqual([
        'rule',
      ]);
      expect(
        errorPaths(parseRule({ kind: 'min', bound: 'x' }, 'number')),
      ).toEqual(['rule.bound']);
    });

    /**
     * @target BoundRule.parseExtra should not apply to strings
     * @dependencies
     * @scenario
     * - parse `min` for a string
     * @expected
     * - a problem at `kind`
     */
    it('should not apply to strings', () => {
      expect(errorPaths(parseRule({ kind: 'min', bound: 1 }))).toEqual([
        'rule.kind',
      ]);
    });
  });

  describe('evaluate', () => {
    /**
     * @target BoundRule.evaluate should pass a value that is not set
     * @dependencies
     * - MinRule
     * @scenario
     * - validate undefined
     * @expected
     * - no problem
     */
    it('should pass a value that is not set', () => {
      expect(
        rule({ kind: 'min', bound: 1 }, 'number').validate(undefined),
      ).toEqual(undefined);
    });
  });
});
