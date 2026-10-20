import { LengthRule } from './lengthRule.js';

/**
 * The `maxLength` rule: a string has at most `limit` code points.
 */
export class MaxLengthRule extends LengthRule {
  protected readonly relation = 'at most';

  /**
   * The kind of the rule, `maxLength`.
   */
  get kind(): string {
    return 'maxLength';
  }

  /**
   * Whether `count` is at most `limit`.
   * @param count - the length of the string in code points
   * @param limit - the length of the rule
   */
  protected compare = (count: number, limit: number): boolean => {
    return count <= limit;
  };
}
