import { Lookup } from '../../evaluators/evaluatorElement.js';
import { OrderCondition } from './orderCondition.js';

/**
 * The `gte` condition (`{ kind: 'gte', left, right }`): both sides are
 * set and the left one is greater than or equal to the right one.
 */
export class GteCondition extends OrderCondition {
  /**
   * The kind of the condition, `gte`.
   */
  get kind(): string {
    return 'gte';
  }

  /**
   * Whether both values are present and the left one is greater
   * than or equal to the right one.
   * @param left - the value of the left side
   * @param right - the value of the right side
   */
  protected compare = (left: Lookup, right: Lookup): boolean => {
    return (
      left.present &&
      right.present &&
      (left.value as number) >= (right.value as number)
    );
  };
}
