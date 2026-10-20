import { ItemCountRule } from './itemCountRule.js';

/**
 * The `minItems` rule: an array has at least `limit` items.
 */
export class MinItemsRule extends ItemCountRule {
  protected readonly relation = 'at least';

  /**
   * The kind of the rule, `minItems`.
   */
  get kind(): string {
    return 'minItems';
  }

  /**
   * Whether `count` is at least the limit.
   * @param count - the number of items of the array
   */
  protected compare = (count: number): boolean => {
    return count >= this.limit;
  };
}
