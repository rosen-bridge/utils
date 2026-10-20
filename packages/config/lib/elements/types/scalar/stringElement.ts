import { Reading, withValue } from '../../../parsing/reading.js';
import { ParseResult, fail, ok } from '../../../parsing/result.js';
import { quote } from '../../../utils/format.js';
import { ScalarElement } from './scalarElement.js';

/**
 * The `string` type: a string.
 */
export class StringElement extends ScalarElement<string> {
  protected readonly expected = 'a string';

  protected readonly typeScriptName = 'string';

  /**
   * The kind of the type, `string`.
   */
  get kind(): string {
    return 'string';
  }

  /**
   * The string as a quoted literal (`'info'`).
   * @param value - the value to write
   */
  literal = (value: string): string => {
    return quote(value);
  };

  /**
   * The value as a string; fails when it is not a string.
   * @param value - the value to convert
   * @param pointer - where a problem is reported
   * @param reading - the reading of the value
   */
  transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<string> => {
    return typeof value === 'string'
      ? ok(value)
      : fail([
          {
            path: pointer,
            message: withValue(reading, value, `must be ${this.expected}`),
          },
        ]);
  };
}
