import { BOOLEAN_BY_STRING } from '../../../constants/index.js';
import { Reading, withValue } from '../../../parsing/reading.js';
import { ParseResult, fail, ok } from '../../../parsing/result.js';
import { ScalarElement } from './scalarElement.js';

/**
 * The `boolean` type: `true` or `false`, written as a boolean or as the
 * string `"true"` or `"false"`.
 */
export class BooleanElement extends ScalarElement<boolean> {
  protected readonly expected = 'a boolean, "true" or "false"';

  protected readonly typeScriptName = 'boolean';

  /**
   * The kind of the type, `boolean`.
   */
  get kind(): string {
    return 'boolean';
  }

  /**
   * `true` or `false`.
   * @param value - the value to write
   */
  literal = (value: boolean): string => {
    return String(value);
  };

  /**
   * The value as a boolean: a boolean, or the string `"true"` or `"false"`;
   * fails for anything else.
   * @param value - the value to convert
   * @param pointer - where a problem is reported
   * @param reading - the reading of the value
   */
  transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<boolean> => {
    const boolean =
      typeof value === 'string' && Object.hasOwn(BOOLEAN_BY_STRING, value)
        ? BOOLEAN_BY_STRING[value]
        : value;
    return typeof boolean === 'boolean'
      ? ok(boolean)
      : fail([
          {
            path: pointer,
            message: withValue(reading, value, `must be ${this.expected}`),
          },
        ]);
  };
}
