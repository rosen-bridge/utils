import { errorPaths, parseRule, rule } from './rulesTestUtils';

describe('PatternRule', () => {
  describe('parseExtra', () => {
    /**
     * @target PatternRule.parseExtra should reject invalid patterns and flags
     * @dependencies
     * @scenario
     * - parse a pattern that does not compile, and a flag that is not a
     *   boolean
     * @expected
     * - problems at `pattern` and at the flag
     */
    it('should reject invalid patterns and flags', () => {
      expect(errorPaths(parseRule({ kind: 'pattern', pattern: '(' }))).toEqual([
        'rule.pattern',
      ]);
      expect(
        errorPaths(
          parseRule({ kind: 'pattern', pattern: 'a', insensitive: 'yes' }),
        ),
      ).toEqual(['rule.insensitive']);
    });

    /**
     * @target PatternRule.parseExtra should turn on the flags set to true
     * @dependencies
     * @scenario
     * - parse `^abc$` with `insensitive`, and `a.b` with `dotall`
     * @expected
     * - `ABC` and `a\nb` match
     */
    it('should turn on the flags set to true', () => {
      expect(
        rule({ kind: 'pattern', pattern: '^abc$', insensitive: true }).validate(
          'ABC',
        ),
      ).toEqual(undefined);
      expect(
        rule({ kind: 'pattern', pattern: 'a.b', dotall: true }).validate(
          'a\nb',
        ),
      ).toEqual(undefined);
    });
  });

  describe('evaluate', () => {
    /**
     * @target PatternRule.evaluate should name the pattern and its flags
     * @dependencies
     * @scenario
     * - validate a string that does not match a pattern with a flag
     * @expected
     * - the message names the pattern and the flag
     */
    it('should name the pattern and its flags', () => {
      expect(
        rule({ kind: 'pattern', pattern: '^0x', multiline: true }).validate(
          'zz',
        ),
      ).toEqual('must match the pattern ^0x (multiline)');
    });

    /**
     * @target PatternRule.evaluate should not be anchored
     * @dependencies
     * @scenario
     * - validate `xabcx` against `abc`, and a missing value
     * @expected
     * - both pass
     */
    it('should not be anchored', () => {
      const pattern = rule({ kind: 'pattern', pattern: 'abc' });
      expect(pattern.validate('xabcx')).toEqual(undefined);
      expect(pattern.validate(undefined)).toEqual(undefined);
    });
  });
});
