import { Lookup } from '../../evaluators/evaluatorElement.js';
import { OrderCondition } from './orderCondition.js';

/**
 * The `lte` condition (`{ kind: 'lte', left, right }`): both sides are
 * set and the left one is less than or equal to the right one.
 */
export class LteCondition extends OrderCondition {
  /**
   * The kind of the condition, `lte`.
   */
  get kind(): string {
    return 'lte';
  }

  /**
   * Whether both values are present and the left one is less than
   * or equal to the right one.
   * @param left - the value of the left side
   * @param right - the value of the right side
   */
  protected compare = (left: Lookup, right: Lookup): boolean => {
    return (
      left.present &&
      right.present &&
      (left.value as number) <= (right.value as number)
    );
  };
}
