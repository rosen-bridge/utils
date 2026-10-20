import { Reading, withValue } from '../../../parsing/reading.js';
import { ParseResult, fail, ok } from '../../../parsing/result.js';
import { isBigintLiteral } from '../../../utils/guards.js';
import { ScalarElement } from './scalarElement.js';

/**
 * The `bigint` type: an integer of any size, written as a `bigint`, a safe
 * integer or an integer string (`"10000000000000000000"`).
 */
export class BigintElement extends ScalarElement<bigint> {
  protected readonly expected = 'a bigint, a safe integer or an integer string';

  protected readonly typeScriptName = 'bigint';

  /**
   * The kind of the type, `bigint`.
   */
  get kind(): string {
    return 'bigint';
  }

  /**
   * The bigint as a bigint literal (`10n`).
   * @param value - the value to write
   */
  literal = (value: bigint): string => {
    return `${value}n`;
  };

  /**
   * The value as a bigint: a `bigint`, a safe integer or an integer string;
   * a number beyond the safe integer range fails, as it may have lost digits.
   * @param value - the value to convert
   * @param pointer - where a problem is reported
   * @param reading - the reading of the value
   */
  transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<bigint> => {
    /**
     * The message of a failure, ending with the value.
     * @param msg - the problem (default: `must be <expected>`)
     */
    const message = (msg?: string) =>
      withValue(reading, value, msg ?? `must be ${this.expected}`);
    switch (typeof value) {
      case 'bigint':
        return ok(value);
      case 'number':
        if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
          return fail([
            {
              path: pointer,
              message: message(
                `must be written as a string: a number beyond ±${Number.MAX_SAFE_INTEGER} may have lost digits`,
              ),
            },
          ]);
        }
        if (!Number.isInteger(value)) {
          return fail([{ path: pointer, message: message() }]);
        }
        return ok(BigInt(value));
      case 'string':
        if (!isBigintLiteral(value)) {
          return fail([{ path: pointer, message: message() }]);
        }
        return ok(BigInt(value));
      default:
        return fail([{ path: pointer, message: message() }]);
    }
  };
}
