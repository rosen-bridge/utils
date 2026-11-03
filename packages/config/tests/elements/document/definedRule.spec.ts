import { DefinedRule } from '../../../lib/elements/document/definedRule';
import { createScope, unwrap } from '../../testUtils';

/**
 * A defined rule for `target` parsed from `node`.
 * @param node - the defined rule's node
 * @param target - the kind it is parsed for
 */
const parseDefined = (node: Record<string, unknown>, target = 'string') =>
  new DefinedRule(createScope(), 'definitions.rules.r', target, [
    'string',
  ]).parse({ type: ['string'], ...node });

/**
 * The paths of the problems of a result.
 * @param result - the result
 */
const errorPaths = (result: ReturnType<typeof parseDefined>) =>
  result.ok ? [] : result.errors.map(({ path }) => path);

describe('DefinedRule', () => {
  describe('parseExtra', () => {
    /**
     * @target DefinedRule.parseExtra should read the description and the
     * rules
     * @dependencies
     * - MinLengthRule
     * @scenario
     * - parse a defined rule with a description and one rule
     * @expected
     * - the description, the rule and the targets
     */
    it('should read the description and the rules', () => {
      const rule = unwrap(
        parseDefined({
          description: 'not empty',
          rules: [{ kind: 'minLength', length: 1 }],
        }),
      );
      expect(rule.description).toEqual('not empty');
      expect(rule.rules.map(({ kind }) => kind)).toEqual(['minLength']);
      expect(rule.targets).toEqual(['string']);
    });

    /**
     * @target DefinedRule.parseExtra should report a bad description and bad
     * rules together
     * @dependencies
     * @scenario
     * - parse a defined rule with a numeric description and no rules, then
     *   with an empty list and a rule with a `when`
     * @expected
     * - problems at `description` and the rule, then at `rules` and `when`
     */
    it('should report a bad description and bad rules together', () => {
      expect(errorPaths(parseDefined({ description: 1 }))).toEqual([
        'definitions.rules.r.description',
        'definitions.rules.r',
      ]);
      expect(errorPaths(parseDefined({ rules: [] }))).toEqual([
        'definitions.rules.r.rules',
      ]);
      expect(
        errorPaths(
          parseDefined({
            rules: [
              {
                kind: 'required',
                when: { kind: 'exists', operand: { path: 'a' } },
              },
            ],
          }),
        ),
      ).toEqual(['definitions.rules.r.rules.0.when']);
    });
  });

  describe('evaluate', () => {
    /**
     * @target DefinedRule.evaluate should give the first failure of its rules
     * @dependencies
     * - MinLengthRule, PatternRule
     * @scenario
     * - validate values against `minLength` 2 and `pattern` `^a`
     * @expected
     * - the length failure first, then the pattern's, then none
     */
    it('should give the first failure of its rules', () => {
      const rule = unwrap(
        parseDefined({
          rules: [
            { kind: 'minLength', length: 2 },
            { kind: 'pattern', pattern: '^a' },
          ],
        }),
      );
      expect(rule.validate('b')).toEqual('must have at least 2 characters');
      expect(rule.validate('bb')).toEqual('must match the pattern ^a');
      expect(rule.validate('ab')).toEqual(undefined);
    });
  });

  describe('requires', () => {
    /**
     * @target DefinedRule.requires should follow its rules
     * @dependencies
     * - RequiredRule, EnumRule
     * @scenario
     * - check a defined rule with `required` and an enum
     * @expected
     * - it requires the value and limits it to the enum
     */
    it('should follow its rules', () => {
      const rule = unwrap(
        parseDefined({
          rules: [{ kind: 'required' }, { kind: 'enum', choices: ['a'] }],
        }),
      );
      expect(rule.requires()).toEqual(true);
      expect(rule.allowedValues()).toEqual(['a']);
    });
  });

  describe('clone', () => {
    /**
     * @target DefinedRule.create should keep the target and the kinds in a
     * copy
     * @dependencies
     * @scenario
     * - clone a defined rule
     * @expected
     * - the copy has the same targets, description and rules
     */
    it('should keep the target and the kinds in a copy', () => {
      const rule = unwrap(
        parseDefined({ description: 'd', rules: [{ kind: 'required' }] }),
      );
      const copy = rule.clone();
      expect([copy.target, copy.targets, copy.description]).toEqual([
        'string',
        ['string'],
        'd',
      ]);
      expect(copy.validate(undefined)).toEqual('must be set');
    });
  });
});
