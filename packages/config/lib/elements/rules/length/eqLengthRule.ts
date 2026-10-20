import { LengthRule } from './lengthRule.js';

/**
 * The `eqLength` rule: a string has exactly `limit` code points.
 */
export class EqLengthRule extends LengthRule {
  protected readonly relation = 'exactly';

  /**
   * The kind of the rule, `eqLength`.
   */
  get kind(): string {
    return 'eqLength';
  }

  /**
   * Whether `count` equals `limit`.
   * @param count - the length of the string in code points
   * @param limit - the length of the rule
   */
  protected compare = (count: number, limit: number): boolean => {
    return count === limit;
  };
}
