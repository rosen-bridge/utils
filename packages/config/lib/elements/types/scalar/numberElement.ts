import { Reading, withValue } from '../../../parsing/reading.js';
import { ParseResult, fail, ok } from '../../../parsing/result.js';
import { isFiniteNumber, isNumberLiteral } from '../../../utils/guards.js';
import { ScalarElement } from './scalarElement.js';

/**
 * The `number` type: a finite number, also written as a number string
 * (`"8080"`, `"2.5"`), as environment variables are.
 */
export class NumberElement extends ScalarElement<number> {
  protected readonly expected = 'a finite number or a number string';

  protected readonly typeScriptName = 'number';

  /**
   * The kind of the type, `number`.
   */
  get kind(): string {
    return 'number';
  }

  /**
   * The number as written (`8080`, `-2.5`).
   * @param value - the value to write
   */
  literal = (value: number): string => {
    return String(value);
  };

  /**
   * The value as a number: a finite number or a number string (`"-2.5"`,
   * `"1e3"`); fails for anything else and beyond the safe integer range.
   * @param value - the value to convert
   * @param pointer - where a problem is reported
   * @param reading - the reading of the value
   */
  transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<number> => {
    const number =
      typeof value === 'string' && isNumberLiteral(value)
        ? Number(value)
        : value;
    if (!isFiniteNumber(number))
      return fail([
        {
          path: pointer,
          message: withValue(reading, value, `must be ${this.expected}`),
        },
      ]);
    if (Math.abs(number) > Number.MAX_SAFE_INTEGER)
      return fail([
        {
          path: pointer,
          message: withValue(
            reading,
            value,
            `is out of bounds: must be between ${Number.MIN_SAFE_INTEGER} and ${Number.MAX_SAFE_INTEGER}`,
          ),
        },
      ]);
    return ok(number);
  };
}
