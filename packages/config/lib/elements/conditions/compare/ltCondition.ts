import { Lookup } from '../../evaluators/evaluatorElement.js';
import { OrderCondition } from './orderCondition.js';

/**
 * The `lt` condition (`{ kind: 'lt', left, right }`): both sides are
 * set and the left one is less than the right one.
 */
export class LtCondition extends OrderCondition {
  /**
   * The kind of the condition, `lt`.
   */
  get kind(): string {
    return 'lt';
  }

  /**
   * Whether both values are present and the left one is less than
   * the right one.
   * @param left - the value of the left side
   * @param right - the value of the right side
   */
  protected compare = (left: Lookup, right: Lookup): boolean => {
    return (
      left.present &&
      right.present &&
      (left.value as number) < (right.value as number)
    );
  };
}
