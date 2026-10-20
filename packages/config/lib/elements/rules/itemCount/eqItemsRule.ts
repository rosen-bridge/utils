import { ItemCountRule } from './itemCountRule.js';

/**
 * The `eqItems` rule: an array has exactly `limit` items.
 */
export class EqItemsRule extends ItemCountRule {
  protected readonly relation = 'exactly';

  /**
   * The kind of the rule, `eqItems`.
   */
  get kind(): string {
    return 'eqItems';
  }

  /**
   * Whether `count` equals the limit.
   * @param count - the number of items of the array
   */
  protected compare = (count: number): boolean => {
    return count === this.limit;
  };
}
