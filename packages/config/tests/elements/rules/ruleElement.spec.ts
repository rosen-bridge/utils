import { createScope, unwrap } from '../../testUtils';
import { conditionRoot } from '../conditions/conditionsTestUtils';
import { errorPaths, parseRule, rule } from './rulesTestUtils';

const when = {
  kind: 'eq',
  left: { path: 'mode' },
  right: { value: 'strict' },
};

describe('RuleElement', () => {
  describe('parseNode', () => {
    /**
     * @target RuleElement.parseNode should accept a `when` only when allowed
     * @dependencies
     * - MinLengthRule, EqCondition
     * @scenario
     * - parse a rule with a `when`, allowed and not allowed
     * @expected
     * - success, then an unknown key at `when`
     */
    it('should accept a `when` only when allowed', () => {
      const node = { kind: 'minLength', length: 1, when };
      expect(parseRule(node).ok).toEqual(true);
      expect(errorPaths(parseRule(node, 'string', false))).toEqual([
        'rule.when',
      ]);
    });

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

  describe('applies', () => {
    /**
     * @target RuleElement.applies should hold without a `when` or when it
     * holds
     * @dependencies
     * - MinLengthRule, EqCondition
     * @scenario
     * - check a rule without `when`, then one with a `when` on `mode`
     * @expected
     * - always for the first, only for mode `strict` for the second
     */
    it('should hold without a `when` or when it holds', () => {
      expect(rule({ kind: 'minLength', length: 1 }).applies({}, [])).toEqual(
        true,
      );
      const conditional = rule({ kind: 'minLength', length: 1, when });
      unwrap(conditional.resolve(conditionRoot, ['port']));
      expect(conditional.conditional()).toEqual(true);
      expect(conditional.applies({ mode: 'strict' }, [])).toEqual(true);
      expect(conditional.applies({ mode: 'loose' }, [])).toEqual(false);
    });
  });

  describe('resolve', () => {
    /**
     * @target RuleElement.resolve should report the problems of its `when`
     * @dependencies
     * - MinLengthRule, EqCondition
     * @scenario
     * - resolve a rule whose `when` reads a missing path
     * @expected
     * - a problem at the path of the `when`
     */
    it('should report the problems of its `when`', () => {
      const conditional = rule({
        kind: 'minLength',
        length: 1,
        when: { ...when, left: { path: 'missing' } },
      });
      expect(errorPaths(conditional.resolve(conditionRoot, []))).toEqual([
        'rule.when.left.path',
      ]);
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
