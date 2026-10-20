import { Lookup } from '../../evaluators/evaluatorElement.js';
import { OrderCondition } from './orderCondition.js';

/**
 * The `gt` condition (`{ kind: 'gt', left, right }`): both sides are
 * set and the left one is greater than the right one.
 */
export class GtCondition extends OrderCondition {
  /**
   * The kind of the condition, `gt`.
   */
  get kind(): string {
    return 'gt';
  }

  /**
   * Whether both values are present and the left one is greater
   * than the right one.
   * @param left - the value of the left side
   * @param right - the value of the right side
   */
  protected compare = (left: Lookup, right: Lookup): boolean => {
    return (
      left.present &&
      right.present &&
      (left.value as number) > (right.value as number)
    );
  };
}
