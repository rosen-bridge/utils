import {
  ACRONYM_BOUNDARY_PATTERN,
  CAMEL_BOUNDARY_PATTERN,
  ENV_NAME_SEPARATOR,
  WORD_SEPARATOR_PATTERN,
} from '../constants/index.js';

/**
 * Formats a scalar value for a message: strings as JSON, other values
 * (numbers, bigints, booleans, `null`) as written.
 * @param value - the value to format
 */
export const formatValue = (value: unknown): string =>
  typeof value === 'string' ? JSON.stringify(value) : String(value);

/**
 * `; expected one of <kinds>` for an unknown-kind message, or nothing when no
 * kind is available.
 * @param kinds - the known kinds
 */
export const expectedKinds = (kinds: Iterable<string>): string => {
  const list = [...kinds];
  return list.length > 0 ? `; expected one of ${list.join(', ')}` : '';
};

/**
 * A string as a single-quoted TypeScript string literal (`'info'`).
 * @param text - the string to quote
 */
export const quote = (text: string): string =>
  `'${JSON.stringify(text).slice(1, -1).replaceAll('\\"', '"').replaceAll("'", "\\'")}'`;

/**
 * A property name as a TypeScript property key: as it is when it is an
 * identifier (`port`), quoted otherwise (`'x-api-key'`).
 * @param name - the property name
 */
export const propertyKey = (name: string): string =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : quote(name);

/**
 * A name as a TypeScript type name: its words capitalized and joined
 * (`my-db` → `MyDb`), prefixed with `T` when it would not start with a letter.
 * @param name - the name to convert
 */
export const typeName = (name: string): string => {
  const words = name.split(/[^A-Za-z0-9]+/).filter((word) => word !== '');
  const joined = words
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
  return /^[A-Za-z]/.test(joined) ? joined : `T${joined}`;
};

/**
 * `text` with every line after the first indented by two spaces, to nest a
 * multi-line TypeScript type in another.
 * @param text - the text to indent
 */
export const indent = (text: string): string => text.replaceAll('\n', '\n  ');

/**
 * A name in UPPER_SNAKE_CASE (`apiToken` → `API_TOKEN`, `HTTPPort` →
 * `HTTP_PORT`, `new-ui` → `NEW_UI`); without letters or digits it gives `''`.
 * @param name - the name to convert
 */
export const envName = (name: string): string =>
  name
    .replace(CAMEL_BOUNDARY_PATTERN, `$1${ENV_NAME_SEPARATOR}$2`)
    .replace(ACRONYM_BOUNDARY_PATTERN, `$1${ENV_NAME_SEPARATOR}$2`)
    .split(WORD_SEPARATOR_PATTERN)
    .filter((word) => word !== '')
    .join(ENV_NAME_SEPARATOR)
    .toUpperCase();
