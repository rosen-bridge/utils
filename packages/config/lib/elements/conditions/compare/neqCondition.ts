import { Lookup } from '../../evaluators/evaluatorElement.js';
import { CompareCondition } from './compareCondition.js';

/**
 * The `neq` condition (`{ kind: 'neq', left, right }`): exactly `not` around
 * `eq`, so it holds when a side is not set or the sides differ.
 */
export class NeqCondition extends CompareCondition {
  /**
   * The kind of the condition, `neq`.
   */
  get kind(): string {
    return 'neq';
  }

  /**
   * Whether the values are not both present and equal.
   * @param left - the value of the left side
   * @param right - the value of the right side
   */
  protected compare = (left: Lookup, right: Lookup): boolean => {
    return !(left.present && right.present && left.value === right.value);
  };
}
