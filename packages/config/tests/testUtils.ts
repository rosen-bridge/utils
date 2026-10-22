import { BuiltinElements } from '../lib/elements/builtinElements';
import { SchemaDocument } from '../lib/elements/document/schemaDocument';
import type { TypeElement } from '../lib/elements/types/typeElement';
import { ParseResult } from '../lib/parsing/result';

/**
 * A new, empty document, used as the scope of elements parsed alone.
 */
export const createScope = (): SchemaDocument =>
  new SchemaDocument(new BuiltinElements());

/**
 * A schema document parsed from `node`.
 * @param node - the schema document node
 * @param file - the absolute path the schema was read from, if any
 */
export const parseDocument = (
  node: Record<string, unknown>,
  file?: string,
): ParseResult<SchemaDocument> =>
  SchemaDocument.initialize(undefined, file).parse(node);

/**
 * A type parsed alone from `node` at the pointer `schema`.
 * @param node - the type node
 * @param location - the configuration path of the type
 */
export const parseType = (
  node: unknown,
  location: readonly string[] = [],
): ParseResult<TypeElement> => {
  const scope = createScope();
  return scope.elements.parseType(node, scope, 'schema', location);
};

/**
 * The value of a successful result; throws with its errors otherwise.
 * @param result - the result to unwrap
 */
export const unwrap = <T>(result: ParseResult<T>): T => {
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

/**
 * Reads `config` with a document whose root type is `schema`.
 * @param schema - the root type node
 * @param config - the configuration to read
 */
export const readConfig = (
  schema: Record<string, unknown>,
  config: unknown,
): ParseResult<unknown> => unwrap(parseDocument({ schema })).validate(config);
