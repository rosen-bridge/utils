import { MinRule } from '../../lib/elements/rules/bound/minRule';
import { RuleElement } from '../../lib/elements/rules/ruleElement';
import { findClasses } from '../../lib/utils/classes';

/**
 * A second rule class of the kind `min`.
 */
class TestMinRule extends MinRule {
  /**
   * The kind of the rule, `min`, defined again.
   */
  get kind(): string {
    return 'min';
  }
}

describe('findClasses', () => {
  /**
   * @target findClasses should throw when two classes have the same kind
   * @dependencies
   * - MinRule
   * @scenario
   * - find the classes of a module with two `min` classes
   * @expected
   * - an error is thrown
   */
  it('should throw when two classes have the same kind', () => {
    expect(() => {
      findClasses({ MinRule, TestMinRule }, RuleElement);
    }).toThrow(Error);
  });
});
