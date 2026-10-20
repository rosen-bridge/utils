import { LengthRule } from './lengthRule.js';

/**
 * The `minLength` rule: a string has at least `limit` code points.
 */
export class MinLengthRule extends LengthRule {
  protected readonly relation = 'at least';

  /**
   * The kind of the rule, `minLength`.
   */
  get kind(): string {
    return 'minLength';
  }

  /**
   * Whether `count` is at least `limit`.
   * @param count - the length of the string in code points
   * @param limit - the length of the rule
   */
  protected compare = (count: number, limit: number): boolean => {
    return count >= limit;
  };
}
