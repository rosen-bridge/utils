/**
 * A problem in a schema, or in a configuration read with it.
 */
export interface SchemaError {
  /**
   * Dotted pointer of the problem in the schema document, e.g.
   * `schema.properties.port.type`, or in the configuration, e.g.
   * `server.port` (`''` is the document or configuration itself).
   */
  readonly path: string;
  readonly message: string;
}

/**
 * Result of parsing a part of a schema: the parsed value, or every problem
 * found in that part.
 */
export type ParseResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly SchemaError[] };

/**
 * Successful result holding `value`.
 * @param value - the parsed value
 */
export const ok = <T>(value: T): ParseResult<T> => ({ ok: true, value });

/**
 * Failed result holding `errors`.
 * @param errors - the problems found
 */
export const fail = (errors: readonly SchemaError[]): ParseResult<never> => ({
  ok: false,
  errors,
});

/**
 * Combines results of different types: the tuple of their values, or the
 * errors of every failed result.
 * @param results - the results to combine
 */
export const combine = <T extends readonly ParseResult<unknown>[]>(
  results: [...T],
): ParseResult<{
  [K in keyof T]: T[K] extends ParseResult<infer V> ? V : never;
}> => {
  const errors = results.flatMap((result) => (result.ok ? [] : result.errors));
  if (errors.length > 0) return fail(errors);
  return ok(
    results.map((result) => (result as { value: unknown }).value) as never,
  );
};

/**
 * Combines results of one type: the list of their values, or the errors of
 * every failed result.
 * @param results - the results to combine
 */
export const all = <T>(
  results: readonly ParseResult<T>[],
): ParseResult<T[]> => {
  const errors = results.flatMap((result) => (result.ok ? [] : result.errors));
  if (errors.length > 0) return fail(errors);
  return ok(results.map((result) => (result as { value: T }).value));
};

/**
 * `errors` without repeats: the first error for each `path` and `message`.
 * @param errors - the errors to filter
 */
export const uniqueErrors = (errors: readonly SchemaError[]): SchemaError[] => {
  const seen = new Set<string>();
  return errors.filter(({ path, message }) => {
    const key = JSON.stringify([path, message]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
