import { Bound, BoundRule } from './boundRule.js';

/**
 * The `min` rule: a number or bigint is at least the bound.
 */
export class MinRule extends BoundRule {
  protected readonly relation = 'at least';

  /**
   * The kind of the rule, `min`.
   */
  get kind(): string {
    return 'min';
  }

  /**
   * Whether `value` is at least the bound.
   * @param value - the number or bigint to check
   */
  protected compare = (value: Bound): boolean => {
    return value >= this.bound;
  };
}
