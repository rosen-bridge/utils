/**
 * A path segment that is an array index (`0`, `12`).
 */
export const INDEX_PATTERN = /^(0|[1-9][0-9]*)$/;

/**
 * The leading dots of a relative configuration path (`..` in `..mode`).
 */
export const LEADING_DOTS_PATTERN = /^\.+/;

/**
 * A lower-case letter or digit followed by an upper-case letter, where a
 * camelCase name starts a new word (`apiToken` → `api_Token`).
 */
export const CAMEL_BOUNDARY_PATTERN = /([a-z0-9])([A-Z])/g;

/**
 * The end of an upper-case run followed by a capitalized word, where an
 * acronym ends (`HTTPPort` → `HTTP_Port`).
 */
export const ACRONYM_BOUNDARY_PATTERN = /([A-Z]+)([A-Z][a-z])/g;

/**
 * A run of characters that are not letters or digits, which separates words
 * (`-` in `new-ui`).
 */
export const WORD_SEPARATOR_PATTERN = /[^A-Za-z0-9]+/;

/**
 * The `id` of a schema: ASCII letters, digits, `-` and `_` (`test-app`,
 * `TestApp`, `test_app2`).
 */
export const ID_PATTERN = /^[a-zA-Z][A-Za-z0-9_-]+$/;

/**
 * An ASCII letter or digit, of which a name needs one to give a TypeScript
 * name (`typeName`).
 */
export const ALPHANUMERIC_PATTERN = /[A-Za-z0-9]/;

/**
 * The flags a `pattern` rule may turn on, each with a boolean key of its
 * name, and the regular expression flag of each. Unicode mode (`u`) is
 * always on.
 */
export const PATTERN_FLAGS: Readonly<Record<string, string>> = {
  insensitive: 'i',
  multiline: 'm',
  dotall: 's',
};

/**
 * The flag every `pattern` rule is compiled with: Unicode mode.
 */
export const UNICODE_FLAG = 'u';

/**
 * The scheme at the start of a URL (`https:` in `https://x/schema.json`),
 * which an import cannot use: only local files and installed packages can
 * be imported.
 */
export const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]+:/;

/**
 * The `as` of an import: an ASCII letter, then letters, digits, `-` and `_`
 * (`c`, `common`, `db-2`).
 */
export const IMPORT_NAME_PATTERN = /^[a-zA-Z][A-Za-z0-9_-]*$/;
