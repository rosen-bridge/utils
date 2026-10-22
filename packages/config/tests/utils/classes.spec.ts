import { MaxRule } from '../../lib/elements/rules/bound/maxRule';
import { MinRule } from '../../lib/elements/rules/bound/minRule';
import { RefRule } from '../../lib/elements/rules/refRule';
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
   * @target findClasses should find the concrete classes by kind, sorted
   * @dependencies
   * - MinRule, MaxRule, RefRule
   * @scenario
   * - find the rule classes of a module with a value that is not a class,
   *   excluding RefRule
   * @expected
   * - `max` and `min`, in that order, with their classes
   */
  it('should find the concrete classes by kind, sorted', () => {
    const found = findClasses(
      { MinRule, MaxRule, RefRule, RuleElement, other: 1 },
      RuleElement,
      [RefRule],
    );
    expect([...found]).toEqual([
      ['max', MaxRule],
      ['min', MinRule],
    ]);
  });

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
