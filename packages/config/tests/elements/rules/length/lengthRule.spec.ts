import { errorPaths, parseRule, rule } from '../rulesTestUtils';

describe('LengthRule', () => {
  describe('parseExtra', () => {
    /**
     * @target LengthRule.parseExtra should require a non-negative integer
     * length
     * @dependencies
     * - MinLengthRule
     * @scenario
     * - parse `minLength` with 1.5
     * @expected
     * - a problem at `length`
     */
    it('should require a non-negative integer length', () => {
      expect(errorPaths(parseRule({ kind: 'minLength', length: 1.5 }))).toEqual(
        ['rule.length'],
      );
    });
  });

  describe('evaluate', () => {
    /**
     * @target LengthRule.evaluate should count code points
     * @dependencies
     * - MaxLengthRule
     * @scenario
     * - validate two emoji and three characters against `maxLength` 2
     * @expected
     * - the emoji pass; three characters fail with a plural message
     */
    it('should count code points', () => {
      const max = rule({ kind: 'maxLength', length: 2 });
      expect(max.validate('😀😀')).toEqual(undefined);
      expect(max.validate('abc')).toEqual('must have at most 2 characters');
      expect(max.validate(undefined)).toEqual(undefined);
    });

    /**
     * @target LengthRule.evaluate should use the singular for one character
     * @dependencies
     * - MinLengthRule
     * @scenario
     * - validate an empty string against `minLength` 1
     * @expected
     * - `must have at least 1 character`
     */
    it('should use the singular for one character', () => {
      expect(rule({ kind: 'minLength', length: 1 }).validate('')).toEqual(
        'must have at least 1 character',
      );
    });
  });
});
