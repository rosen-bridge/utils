import { Bound, BoundRule } from './boundRule.js';

/**
 * The `max` rule: a number or bigint is at most the bound.
 */
export class MaxRule extends BoundRule {
  protected readonly relation = 'at most';

  /**
   * The kind of the rule, `max`.
   */
  get kind(): string {
    return 'max';
  }

  /**
   * Whether `value` is at most the bound.
   * @param value - the number or bigint to check
   */
  protected compare = (value: Bound): boolean => {
    return value <= this.bound;
  };
}
