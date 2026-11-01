import { errorPaths, parseRule, rule } from './rulesTestUtils';

describe('EnumRule', () => {
  describe('parseExtra', () => {
    /**
     * @target EnumRule.parseExtra should convert the choices to the target
     * type
     * @dependencies
     * - NumberElement
     * @scenario
     * - parse a number enum with `"8080"` and validate 8080
     * @expected
     * - the value passes
     */
    it('should convert the choices to the target type', () => {
      expect(
        rule({ kind: 'enum', choices: ['8080', 443] }, 'number').validate(8080),
      ).toEqual(undefined);
    });

    /**
     * @target EnumRule.parseExtra should reject invalid and repeated choices
     * @dependencies
     * - NumberElement
     * @scenario
     * - parse an enum that is not a list, one with a value that does not
     *   convert and one with a repeated value
     * @expected
     * - problems at `choices`, the bad value and the repeated value
     */
    it('should reject invalid and repeated choices', () => {
      expect(errorPaths(parseRule({ kind: 'enum', choices: [] }))).toEqual([
        'rule.choices',
      ]);
      expect(
        errorPaths(parseRule({ kind: 'enum', choices: [1, 'x'] }, 'number')),
      ).toEqual(['rule.choices.1']);
      expect(
        errorPaths(parseRule({ kind: 'enum', choices: [1, '1'] }, 'number')),
      ).toEqual(['rule.choices.1']);
    });

    /**
     * @target EnumRule.parseExtra should not apply to other kinds
     * @dependencies
     * @scenario
     * - parse an enum for an array
     * @expected
     * - a problem at `kind`
     */
    it('should not apply to other kinds', () => {
      expect(
        errorPaths(parseRule({ kind: 'enum', choices: [1] }, 'array')),
      ).toEqual(['rule.kind']);
    });
  });

  describe('evaluate', () => {
    /**
     * @target EnumRule.evaluate should accept the choices only
     * @dependencies
     * @scenario
     * - validate `info`, `trace` and a missing value
     * @expected
     * - only `trace` fails, listing the choices
     */
    it('should accept the choices only', () => {
      const levels = rule({ kind: 'enum', choices: ['info', 'warn'] });
      expect(levels.validate('info')).toEqual(undefined);
      expect(levels.validate(undefined)).toEqual(undefined);
      expect(levels.validate('trace')).toEqual('must be one of "info", "warn"');
    });
  });

  describe('allowedValues', () => {
    /**
     * @target EnumRule.allowedValues should list the choices unless the rule
     * has a `when`
     * @dependencies
     * - ExistsCondition
     * @scenario
     * - read the allowed values of a plain and a conditional enum
     * @expected
     * - the choices, then undefined
     */
    it('should list the choices unless the rule has a `when`', () => {
      expect(rule({ kind: 'enum', choices: ['a'] }).allowedValues()).toEqual([
        'a',
      ]);
      expect(
        rule({
          kind: 'enum',
          choices: ['a'],
          when: { kind: 'exists', operand: { path: 'x' } },
        }).allowedValues(),
      ).toEqual(undefined);
    });
  });
});
