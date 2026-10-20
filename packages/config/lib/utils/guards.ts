/**
 * Whether a value is a non-array object.
 * @param value - the value to check
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Whether a value is a safe integer of at least 0 (a length or a count).
 * @param value - the value to check
 */
export const isNonNegativeInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;

/**
 * Whether a value is a finite number.
 * @param value - the value to check
 */
export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * Whether a string is a decimal number literal: an optional sign, digits with
 * an optional fraction and an optional exponent (`8080`, `-2.5`, `1e3`).
 * @param text - the string to check
 */
export const isNumberLiteral = (text: string): boolean =>
  /^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?$/.test(text);

/**
 * Whether a string is a `bigint` literal: decimal digits with an optional
 * sign (`42`, `-7`, `+007`), no fraction and no exponent.
 * @param text - the string to check
 */
export const isBigintLiteral = (text: string): boolean =>
  /^[+-]?[0-9]+$/.test(text);

/**
 * Whether a value is a non-empty array.
 * @param value - the value to check
 */
export const isNonEmptyArray = (value: unknown): value is unknown[] =>
  Array.isArray(value) && value.length > 0;

/**
 * Whether a value is a string.
 * @param value - the value to check
 */
export const isString = (value: unknown): value is string =>
  typeof value === 'string';

/**
 * Whether `value` is a scalar: a string, a number, a bigint, a boolean or
 * `null`.
 * @param value - the value to check
 */
export const isScalarValue = (
  value: unknown,
): value is string | number | bigint | boolean | null =>
  value === null ||
  ['string', 'number', 'bigint', 'boolean'].includes(typeof value);
