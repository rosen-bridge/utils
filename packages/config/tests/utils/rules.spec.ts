import type { RuleElement } from '../../lib/elements/rules/ruleElement';
import { allowedByAll } from '../../lib/utils/rules';
import { createScope, unwrap } from '../testUtils';

/**
 * Rules of a string type parsed from `nodes`.
 * @param nodes - the rule nodes
 */
const parseRules = (nodes: unknown[]): RuleElement[] => {
  const scope = createScope();
  return nodes.map((node, index) =>
    unwrap(scope.elements.parseRule(node, scope, `r.${index}`, 'string', true)),
  );
};

describe('allowedByAll', () => {
  /**
   * @target allowedByAll should intersect the values of the enum rules
   * @dependencies
   * - EnumRule
   * @scenario
   * - take two enum rules and a pattern rule
   * @expected
   * - the values in both enums
   */
  it('should intersect the values of the enum rules', () => {
    const rules = parseRules([
      { kind: 'enum', choices: ['a', 'b', 'c'] },
      { kind: 'pattern', pattern: 'a|b' },
      { kind: 'enum', choices: ['b', 'a'] },
    ]);
    expect(allowedByAll(rules)).toEqual(['a', 'b']);
  });

  /**
   * @target allowedByAll should ignore conditional enums and return
   * undefined without a limit
   * @dependencies
   * - EnumRule
   * @scenario
   * - take an enum rule with a `when`
   * @expected
   * - undefined
   */
  it('should ignore conditional enums and return undefined without a limit', () => {
    const rules = parseRules([
      {
        kind: 'enum',
        choices: ['a'],
        when: { kind: 'exists', operand: { path: 'x' } },
      },
    ]);
    expect(allowedByAll(rules)).toEqual(undefined);
  });
});
