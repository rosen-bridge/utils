import { ItemCountRule } from './itemCountRule.js';

/**
 * The `maxItems` rule: an array has at most `limit` items.
 */
export class MaxItemsRule extends ItemCountRule {
  protected readonly relation = 'at most';

  /**
   * The kind of the rule, `maxItems`.
   */
  get kind(): string {
    return 'maxItems';
  }

  /**
   * Whether `count` is at most the limit.
   * @param count - the number of items of the array
   */
  protected compare = (count: number): boolean => {
    return count <= this.limit;
  };
}
