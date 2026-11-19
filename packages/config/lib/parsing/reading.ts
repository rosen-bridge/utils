import { formatValue } from '../utils/format';
import { isScalarValue } from '../utils/guards';
import type { SchemaError } from './result';

/**
 * The check of a conditional rule on a read value, run once the whole
 * configuration is read: the rule's errors when its `when` holds for the
 * read configuration.
 */
export type DeferredCheck = (config: unknown) => readonly SchemaError[];

/**
 * What reading a value with a type (`TypeElement.normalize`) needs and
 * collects besides the value.
 */
export interface Reading {
  /**
   * Starts every message: `'default'` for a schema default, empty for a
   * configuration.
   */
  readonly subject: string;
  /**
   * Whether the value is secret (it is, or is below, a type with
   * `secret: true`), so it never appears in messages.
   */
  readonly secret: boolean;
  /**
   * The whole configuration, against which union options' `when` is checked
   * (`undefined` for a schema value, so every option applies).
   */
  readonly config?: unknown;
  /**
   * The checks of conditional rules, run once the whole value is read.
   */
  readonly deferred: DeferredCheck[];
}

/**
 * A new reading whose messages start with `subject`.
 * @param subject - the start of every message (`default`, or empty)
 * @param config - the configuration being read (none for a schema value)
 */
export const createReading = (subject = '', config?: unknown): Reading => ({
  subject,
  secret: false,
  config,
  deferred: [],
});

/**
 * `text` after `subject`, or `text` alone when the subject is empty
 * (`default must be a string`, `must be a string`).
 * @param subject - the subject of the message
 * @param text - the rest of the message
 */
export const withSubject = (subject: string, text: string): string =>
  subject === '' ? text : `${subject} ${text}`;

/**
 * `text` after the subject, followed by the value when it is a scalar and the
 * reading is not secret (`must be at most 65535, got 70000`).
 * @param reading - the reading of the value
 * @param value - the value the message is about
 * @param text - the rest of the message
 */
export const withValue = (
  reading: Reading,
  value: unknown,
  text: string,
): string => {
  const message = withSubject(reading.subject, text);
  const shown =
    reading.secret || !isScalarValue(value) ? undefined : formatValue(value);
  return shown === undefined ? message : `${message}, got ${shown}`;
};
