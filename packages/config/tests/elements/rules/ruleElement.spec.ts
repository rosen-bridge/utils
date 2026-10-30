import { createScope } from '../../testUtils';
import { errorPaths, parseRule, rule } from './rulesTestUtils';

describe('RuleElement', () => {
  describe('parseNode', () => {
    /**
     * @target RuleElement.parseNode should check the message
     * @dependencies
     * - MinLengthRule
     * @scenario
     * - parse rules with an empty message and one of 501 characters
     * @expected
     * - a problem at `message` each time
     */
    it('should check the message', () => {
      for (const message of ['', 'x'.repeat(501)])
        expect(
          errorPaths(parseRule({ kind: 'minLength', length: 1, message })),
        ).toEqual(['rule.message']);
    });
  });

  describe('parseKey', () => {
    /**
     * @target RuleElement.parseKey should require a valid parameter
     * @dependencies
     * - MinLengthRule
     * @scenario
     * - parse `minLength` without `length`, then with `-1`
     * @expected
     * - a problem at the rule, then at `length`
     */
    it('should require a valid parameter', () => {
      expect(errorPaths(parseRule({ kind: 'minLength' }))).toEqual(['rule']);
      expect(errorPaths(parseRule({ kind: 'minLength', length: -1 }))).toEqual([
        'rule.length',
      ]);
    });
  });

  describe('validate', () => {
    /**
     * @target RuleElement.validate should use the custom message of a failed
     * rule
     * @dependencies
     * - MinLengthRule
     * @scenario
     * - validate a short string with and without a custom message
     * @expected
     * - the custom message, then the rule's own
     */
    it('should use the custom message of a failed rule', () => {
      expect(
        rule({ kind: 'minLength', length: 3, message: 'too short' }).validate(
          'a',
        ),
      ).toEqual('too short');
      expect(rule({ kind: 'minLength', length: 3 }).validate('abc')).toEqual(
        undefined,
      );
    });
  });

  describe('clone', () => {
    /**
     * @target RuleElement.clone should copy the rule to another place
     * @dependencies
     * - MinLengthRule
     * @scenario
     * - clone a rule with a message at another pointer
     * @expected
     * - a new rule at that pointer that checks the same
     */
    it('should copy the rule to another place', () => {
      const original = rule({ kind: 'minLength', length: 2, message: 'm' });
      const copy = original.clone(createScope(), 'other');
      expect(copy).not.toBe(original);
      expect(copy.pointer).toEqual('other');
      expect(copy.validate('a')).toEqual('m');
    });
  });
});
