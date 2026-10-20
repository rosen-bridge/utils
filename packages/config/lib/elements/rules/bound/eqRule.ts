import { Bound, BoundRule } from './boundRule.js';

/**
 * The `eq` rule: a number or bigint equals the bound.
 */
export class EqRule extends BoundRule {
  protected readonly relation = 'equal to';

  /**
   * The kind of the rule, `eq`.
   */
  get kind(): string {
    return 'eq';
  }

  /**
   * Whether `value` equals the bound (both have the type of the target).
   * @param value - the number or bigint to check
   */
  protected compare = (value: Bound): boolean => {
    return value === this.bound;
  };
}
