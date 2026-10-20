import { Lookup } from '../../evaluators/evaluatorElement.js';
import { CompareCondition } from './compareCondition.js';

/**
 * The `eq` condition (`{ kind: 'eq', left, right }`): both sides are set and
 * equal.
 */
export class EqCondition extends CompareCondition {
  /**
   * The kind of the condition, `eq`.
   */
  get kind(): string {
    return 'eq';
  }

  /**
   * Whether both values are present and equal.
   * @param left - the value of the left side
   * @param right - the value of the right side
   */
  protected compare = (left: Lookup, right: Lookup): boolean => {
    return left.present && right.present && left.value === right.value;
  };
}
